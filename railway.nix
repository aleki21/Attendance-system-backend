{ pkgs }:

pkgs.buildNpmPackage rec {
  name = "church-attendance-backend";
  src = ./.;
  
  npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  nativeBuildInputs = with pkgs; [
    nodejs_18
    typescript
  ];

  buildPhase = ''
    npm run build
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist $out/
    cp -r node_modules $out/
    cp package.json $out/
  '';
}