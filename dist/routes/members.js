import { Router } from "express";
import { db } from "../config/db.js";
import { members } from "../db/schema/index.js";
import { eq, and, like, count } from "drizzle-orm";
import { z } from "zod";
const router = Router();
// Validation schemas - Phone is completely optional for ALL age groups
const createMemberSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    ageGroup: z.enum(["child", "youth", "adult"]),
    gender: z.enum(["male", "female"]),
    residence: z.string().min(1, "Residence is required").trim(),
    phone: z.string().optional().nullable(),
}).refine((data) => {
    // Kenyan phone validation (254XXXXXXXXX) - only validate if phone is provided and not empty
    if (data.phone && data.phone.trim() !== "") {
        return /^254\d{9}$/.test(data.phone.trim());
    }
    return true;
}, {
    message: "Phone must be in format 254XXXXXXXXX (12 digits starting with 254)",
    path: ["phone"]
});
// =========================
// GET ALL MEMBERS
// =========================
router.get("/", async (req, res) => {
    try {
        const { search, ageGroup, gender, page = 1, limit = 1000 } = req.query;
        // Build query with all conditions at once
        const membersList = await db
            .select()
            .from(members)
            .where(and(search ? like(members.name, `%${search}%`) : undefined, ageGroup && ageGroup !== 'all' ? eq(members.ageGroup, ageGroup) : undefined, gender && gender !== 'all' ? eq(members.gender, gender) : undefined))
            .limit(Number(limit))
            .offset((Number(page) - 1) * Number(limit));
        // Get total count with same filters
        const totalResult = await db
            .select({ count: count() })
            .from(members)
            .where(and(search ? like(members.name, `%${search}%`) : undefined, ageGroup && ageGroup !== 'all' ? eq(members.ageGroup, ageGroup) : undefined, gender && gender !== 'all' ? eq(members.gender, gender) : undefined));
        const total = totalResult[0].count;
        res.json({
            members: membersList,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("❌ Get members error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// =========================
// GET MEMBER STATISTICS
// =========================
router.get("/stats", async (req, res) => {
    try {
        const ageGroups = await db
            .select({
            ageGroup: members.ageGroup,
            count: count()
        })
            .from(members)
            .groupBy(members.ageGroup);
        const totalResult = await db.select({ count: count() }).from(members);
        const total = totalResult[0].count;
        // Calculate percentages
        const distribution = ageGroups.map(group => ({
            group: group.ageGroup,
            count: group.count,
            percentage: Math.round((group.count / total) * 100)
        }));
        res.json({
            totalMembers: total,
            ageDistribution: distribution
        });
    }
    catch (error) {
        console.error("❌ Get member stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// =========================
// CREATE MEMBER
// =========================
router.post("/", async (req, res) => {
    try {
        console.log("📥 Received create member request:", req.body);
        const validationResult = createMemberSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.log("❌ Validation failed:", validationResult.error.issues);
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }
        const { name, ageGroup, gender, residence, phone } = validationResult.data;
        console.log("✅ Validated data:", { name, ageGroup, gender, residence, phone });
        // REMOVED: Phone uniqueness check for ALL age groups
        // Phone numbers can be shared by anyone now
        // Insert member
        const [newMember] = await db
            .insert(members)
            .values({
            name: name.trim(),
            ageGroup,
            gender,
            residence: residence.trim(),
            phone: phone && phone.trim() !== "" ? phone.trim() : null,
        })
            .returning();
        console.log("✅ Member created successfully:", newMember);
        res.status(201).json({
            message: "✅ Member registered successfully",
            member: newMember
        });
    }
    catch (error) {
        console.error("❌ Create member error:", error);
        res.status(500).json({
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// =========================
// UPDATE MEMBER
// =========================
router.put("/:id", async (req, res) => {
    try {
        const memberId = parseInt(req.params.id);
        console.log("📥 Received update request for ID:", memberId, "Data:", req.body);
        const validationResult = createMemberSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.log("❌ Validation failed:", validationResult.error.issues);
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }
        const { name, ageGroup, gender, residence, phone } = validationResult.data;
        // Check if member exists
        const existingMember = await db
            .select()
            .from(members)
            .where(eq(members.memberId, memberId));
        if (existingMember.length === 0) {
            return res.status(404).json({ message: "Member not found" });
        }
        // REMOVED: Phone uniqueness check for ALL age groups
        // Phone numbers can be shared by anyone now
        // Update member
        const [updatedMember] = await db
            .update(members)
            .set({
            name: name.trim(),
            ageGroup,
            gender,
            residence: residence.trim(),
            phone: phone && phone.trim() !== "" ? phone.trim() : null,
        })
            .where(eq(members.memberId, memberId))
            .returning();
        console.log("✅ Member updated successfully:", updatedMember);
        res.json({
            message: "✅ Member updated successfully",
            member: updatedMember
        });
    }
    catch (error) {
        console.error("❌ Update member error:", error);
        res.status(500).json({
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// =========================
// DELETE MEMBER
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const memberId = parseInt(req.params.id);
        // Check if member exists
        const existingMember = await db
            .select()
            .from(members)
            .where(eq(members.memberId, memberId));
        if (existingMember.length === 0) {
            return res.status(404).json({ message: "Member not found" });
        }
        await db
            .delete(members)
            .where(eq(members.memberId, memberId));
        res.json({ message: "✅ Member deleted successfully" });
    }
    catch (error) {
        console.error("❌ Delete member error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
export default router;
