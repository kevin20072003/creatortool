PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'ADMIN',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Tool" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "content" TEXT NOT NULL DEFAULT '',
  "templateType" TEXT NOT NULL DEFAULT 'content-only',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "popular" BOOLEAN NOT NULL DEFAULT false,
  "iconName" TEXT,
  "customAds" BOOLEAN NOT NULL DEFAULT false,
  "scanType" TEXT,
  "frameRate" REAL,
  "fieldRate" REAL,
  "videoFormatPreset" TEXT,
  "interlaceWarnings" BOOLEAN NOT NULL DEFAULT true,
  "onlineDeliveryRecommendation" BOOLEAN NOT NULL DEFAULT true,
  "featuredImage" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "keywords" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "categoryId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Tool_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ToolRelation" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "sourceToolId" INTEGER NOT NULL,
  "relatedToolId" INTEGER NOT NULL,
  CONSTRAINT "ToolRelation_sourceToolId_fkey" FOREIGN KEY ("sourceToolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ToolRelation_relatedToolId_fkey" FOREIGN KEY ("relatedToolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "featuredImage" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "tags" TEXT,
  "categoryId" INTEGER,
  "publishedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Page" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "FAQ" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "toolId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "FAQ_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AdSlot" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL DEFAULT '',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL DEFAULT '',
  "group" TEXT NOT NULL DEFAULT 'general',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Media" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "filename" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER NOT NULL DEFAULT 0,
  "alt" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "type" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "entitySlug" TEXT,
  "device" TEXT,
  "referrer" TEXT,
  "metadata" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SearchLog" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "query" TEXT NOT NULL,
  "results" INTEGER NOT NULL DEFAULT 0,
  "device" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AdminLog" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" INTEGER,
  "message" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Tool_slug_key" ON "Tool"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "ToolRelation_sourceToolId_relatedToolId_key" ON "ToolRelation"("sourceToolId", "relatedToolId");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AdSlot_name_key" ON "AdSlot"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");

PRAGMA foreign_keys=ON;
