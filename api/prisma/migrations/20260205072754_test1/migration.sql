-- CreateTable
CREATE TABLE "persons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_states" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isReleased" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gallery_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comments_editToken_key" ON "comments"("editToken");

-- CreateIndex
CREATE INDEX "comments_personId_idx" ON "comments"("personId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
