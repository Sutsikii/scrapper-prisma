import { PrismaClient } from "../../prisma/generated/client1";

const prisma1 = new PrismaClient();


export const dbConnectionTest = async () => {
    console.log("DB Connection Test : START");
    try {
        await prisma1.$connect();
        console.log('Connected to the database 1 (postgre)');
    } catch (error) {
        console.error('Error connecting to the database :', error);
        return false;
    } finally {
        await prisma1.$disconnect();
        console.log("DB Connection Test (postgre) : END");
    }

    return true
}