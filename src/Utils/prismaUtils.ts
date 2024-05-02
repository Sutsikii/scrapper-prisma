import { PrismaClient as PrismaClient1 } from "../../prisma/schema1/generated/client1";
import { PrismaClient as PrismaClient2 } from "../../prisma/schema2/generated/client2";

// Initialisation des clients Prisma
const prisma1 = new PrismaClient1();
const prisma2 = new PrismaClient2();

export const dbConnectionTest = async () => {
    console.log("DB Connection Test : START");
    try {
        await prisma1.$connect();
        await prisma2.$connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database :', error);
        return false;
    } finally {
        await prisma1.$disconnect();
        await prisma2.$disconnect();
        console.log("DB Connection Test : END");
    }

    return true
}