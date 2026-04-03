-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "businessName" TEXT,
    "ownerName" TEXT,
    "tones" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NailColor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hex" TEXT,
    "profileId" INTEGER NOT NULL,
    CONSTRAINT "NailColor_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NailShape" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    CONSTRAINT "NailShape_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NailLength" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    CONSTRAINT "NailLength_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
