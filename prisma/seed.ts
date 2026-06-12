import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@minimall.com",
      passwordHash: adminHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create test user
  const userHash = await bcrypt.hash("user123", 10);
  const user = await prisma.user.create({
    data: {
      email: "user@minimall.com",
      passwordHash: userHash,
      name: "Test User",
      role: "USER",
    },
  });
  console.log("Created user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "电子产品",
        slug: "electronics",
        description: "手机、电脑、耳机等数码产品",
      },
    }),
    prisma.category.create({
      data: {
        name: "服装配饰",
        slug: "clothing",
        description: "男装、女装、包包、首饰",
      },
    }),
    prisma.category.create({
      data: {
        name: "家居生活",
        slug: "home-living",
        description: "家具、厨具、装饰品",
      },
    }),
    prisma.category.create({
      data: {
        name: "图书文具",
        slug: "books-stationery",
        description: "书籍、文具、办公用品",
      },
    }),
  ]);
  console.log(
    "Created categories:",
    categories.map((c) => c.name).join(", ")
  );

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "无线蓝牙耳机 Pro",
        slug: "wireless-bluetooth-earbuds-pro",
        description:
          "高品质无线蓝牙耳机，支持主动降噪，续航长达 30 小时。采用 10mm 动圈单元，音质出色。IPX5 防水等级，运动无忧。",
        price: 299,
        stock: 150,
        imageUrl: "https://picsum.photos/seed/earbuds/400/400",
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "便携式充电宝 20000mAh",
        slug: "portable-power-bank-20000",
        description:
          "大容量 20000mAh 便携充电宝，支持 22.5W 快充，Type-C 双向快充。LED 电量显示，轻薄便携。",
        price: 129,
        stock: 200,
        imageUrl: "https://picsum.photos/seed/powerbank/400/400",
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "机械键盘 RGB 87键",
        slug: "mechanical-keyboard-rgb-87",
        description:
          "87 键紧凑布局机械键盘，Cherry MX 红轴，RGB 背光，铝合金面板，PBT 键帽。办公游戏两相宜。",
        price: 459,
        stock: 80,
        imageUrl: "https://picsum.photos/seed/keyboard/400/400",
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "简约纯棉 T 恤",
        slug: "simple-cotton-tshirt",
        description:
          "100% 纯棉面料，柔软亲肤，透气舒适。经典圆领设计，多色可选。可机洗，不变形。",
        price: 89,
        stock: 500,
        imageUrl: "https://picsum.photos/seed/tshirt/400/400",
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "时尚帆布双肩包",
        slug: "fashion-canvas-backpack",
        description:
          "复古帆布双肩包，大容量主仓，独立电脑隔层可放 15.6 寸笔记本。加厚肩带，背负舒适。",
        price: 159,
        stock: 120,
        imageUrl: "https://picsum.photos/seed/backpack/400/400",
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "北欧风台灯",
        slug: "nordic-style-desk-lamp",
        description:
          "简约北欧风 LED 台灯，三档色温调节，无极亮度调光。护眼无频闪，金属灯杆，品质之选。",
        price: 199,
        stock: 60,
        imageUrl: "https://picsum.photos/seed/desklamp/400/400",
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "真空保温杯 500ml",
        slug: "vacuum-thermos-500ml",
        description:
          "316 不锈钢内胆，12 小时保温 8 小时保冷。食品级材质，安全健康。轻量化设计，随身携带无负担。",
        price: 79,
        stock: 300,
        imageUrl: "https://picsum.photos/seed/thermos/400/400",
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "TypeScript 实战指南",
        slug: "typescript-practical-guide",
        description:
          "从入门到精通，涵盖类型系统、泛型、模块化、工具类型等核心主题。附带 50+ 实战项目源码。",
        price: 69,
        stock: 1000,
        imageUrl: "https://picsum.photos/seed/tsbook/400/400",
        categoryId: categories[3].id,
      },
    }),
  ]);
  console.log(`Created ${products.length} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
