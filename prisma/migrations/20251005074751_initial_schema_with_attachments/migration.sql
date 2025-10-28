-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `fullName` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `vesselName` VARCHAR(191) NOT NULL,
    `customerCompany` VARCHAR(191) NULL,
    `vesselSpecs` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_item_templates` (
    `id` VARCHAR(191) NOT NULL,
    `packageLetter` VARCHAR(1) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `itemNumber` VARCHAR(10) NULL,
    `itemTitle` TEXT NULL,
    `parentTemplateId` VARCHAR(191) NULL,
    `level` VARCHAR(191) NOT NULL,
    `subLetter` VARCHAR(1) NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NULL,
    `volume` DECIMAL(10, 2) NULL,
    `unit` VARCHAR(10) NULL,
    `hasRealization` BOOLEAN NOT NULL DEFAULT false,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_item_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NULL,
    `mimeType` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `workItemId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_items` (
    `id` VARCHAR(191) NOT NULL,
    `number` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NULL,
    `volume` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `completion` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(191) NULL,
    `parentId` VARCHAR(191) NULL,
    `package` VARCHAR(191) NULL,
    `durationDays` INTEGER NULL,
    `startDate` VARCHAR(191) NULL,
    `finishDate` VARCHAR(191) NULL,
    `resourceNames` VARCHAR(191) NOT NULL DEFAULT '',
    `isMilestone` BOOLEAN NOT NULL DEFAULT false,
    `dependsOnIds` JSON NULL,
    `projectId` VARCHAR(191) NULL,
    `templateId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PLANNED',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `assignedTo` VARCHAR(191) NULL,
    `estimatedHours` INTEGER NULL,
    `actualHours` INTEGER NULL,
    `completion` INTEGER NOT NULL DEFAULT 0,
    `workItemId` VARCHAR(191) NULL,
    `resourceNames` VARCHAR(191) NOT NULL DEFAULT '',
    `dependencies` JSON NULL,
    `tags` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `work_item_templates` ADD CONSTRAINT `work_item_templates_parentTemplateId_fkey` FOREIGN KEY (`parentTemplateId`) REFERENCES `work_item_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_item_attachments` ADD CONSTRAINT `work_item_attachments_workItemId_fkey` FOREIGN KEY (`workItemId`) REFERENCES `work_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_items` ADD CONSTRAINT `work_items_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `work_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_items` ADD CONSTRAINT `work_items_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_items` ADD CONSTRAINT `work_items_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `work_item_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_workItemId_fkey` FOREIGN KEY (`workItemId`) REFERENCES `work_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
