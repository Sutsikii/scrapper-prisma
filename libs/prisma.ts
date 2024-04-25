import { PrismaClient as PrismaClient1 } from "../prisma/schema1/generated/client1";
import { PrismaClient as PrismaClient2 } from "../prisma/schema2/generated/client2";

// Initialisation des clients Prisma
const prisma1 = new PrismaClient1();
const prisma2 = new PrismaClient2();

// Exportation des fonctions pour interagir avec la base de données
export const getUsersFromDB1 = async () => {
    return await prisma1.userSQL.findMany();
};

export const getUsersFromDB2 = async () => {
    return await prisma2.userNO.findMany();
};

