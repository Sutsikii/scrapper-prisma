import { PrismaClient as PrismaClient1 } from "../prisma/schema1/generated/client1";
import { PrismaClient as PrismaClient2 } from "../prisma/schema2/generated/client2";

async function main() {
    const prisma = new PrismaClient1();  
    const prisma2 = new PrismaClient2();

    try {

        const user2 = await prisma2.userNO.create({
            data: {
                username: 'testUser',
                password: 'testPass123',
                email: 'test@example.com'
            }
        });

        const user = await prisma.userSQL.create({
            data: {
                username: 'testUser',
                password: 'testPass123', 
                email: 'testttt@example.com'
            }
        });

        console.log(`User created: ${user.username} (ID: ${user.id})`);
        console.log(`User created: ${user2.username} (ID: ${user2.id})`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect(); 
        await prisma2.$disconnect();
    }
}

main();
