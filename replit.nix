{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript
    pkgs.nodePackages.npm
    pkgs.nodePackages.prisma
    pkgs.sqlite
    pkgs.openssl
  ];

  env = {
    NODE_ENV = "production";
    DATABASE_URL = "file:./prisma/dev.db";
  };
}
