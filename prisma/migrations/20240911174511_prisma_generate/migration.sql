-- CreateTable
CREATE TABLE `Players` (
    `playerid` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Players_id_key`(`id`),
    PRIMARY KEY (`playerid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Characters` (
    `characterid` INTEGER NOT NULL AUTO_INCREMENT,
    `playerid` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hp` INTEGER NOT NULL DEFAULT 500,
    `attackpower` INTEGER NOT NULL DEFAULT 100,
    `money` INTEGER NOT NULL DEFAULT 10000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`characterid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterItem` (
    `characteritemid` INTEGER NOT NULL AUTO_INCREMENT,
    `characterid` INTEGER NOT NULL,
    `weaponid` INTEGER NULL,
    `headid` INTEGER NULL,
    `armorid` INTEGER NULL,
    `cloakid` INTEGER NULL,
    `gloveid` INTEGER NULL,
    `shoesid` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CharacterItem_characterid_key`(`characterid`),
    PRIMARY KEY (`characteritemid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `inventoryid` INTEGER NOT NULL AUTO_INCREMENT,
    `characterid` INTEGER NOT NULL,
    `size` INTEGER NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inventory_characterid_key`(`characterid`),
    PRIMARY KEY (`inventoryid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipItem` (
    `equipitemid` INTEGER NOT NULL AUTO_INCREMENT,
    `characteritemid` INTEGER NULL,
    `inventoryid` INTEGER NULL,
    `hp` INTEGER NOT NULL,
    `attackpower` INTEGER NOT NULL,
    `money` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`equipitemid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Characters` ADD CONSTRAINT `Characters_playerid_fkey` FOREIGN KEY (`playerid`) REFERENCES `Players`(`playerid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterItem` ADD CONSTRAINT `CharacterItem_characterid_fkey` FOREIGN KEY (`characterid`) REFERENCES `Characters`(`characterid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_characterid_fkey` FOREIGN KEY (`characterid`) REFERENCES `Characters`(`characterid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipItem` ADD CONSTRAINT `EquipItem_characteritemid_fkey` FOREIGN KEY (`characteritemid`) REFERENCES `CharacterItem`(`characteritemid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipItem` ADD CONSTRAINT `EquipItem_inventoryid_fkey` FOREIGN KEY (`inventoryid`) REFERENCES `Inventory`(`inventoryid`) ON DELETE CASCADE ON UPDATE CASCADE;
