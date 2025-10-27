-- CreateTable
CREATE TABLE "DBProfilePicture" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "backgroundColor" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DBProfilePicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DBProfilePicture_userId_key" ON "DBProfilePicture"("userId");

-- CreateIndex
CREATE INDEX "DBProfilePicture_userId_idx" ON "DBProfilePicture"("userId");

-- AddForeignKey
ALTER TABLE "DBProfilePicture" ADD CONSTRAINT "DBProfilePicture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
