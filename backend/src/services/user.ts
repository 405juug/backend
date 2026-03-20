// @ts-ignore

import prisma from "../ws/db"

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const createUser = async (username: string, email: string, password: string) => {
    return prisma.user.create({
        data: { username, email, password }
    });
};

export const findUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, username: true }
    });
};

export const findUserByUsername = async (username: string) => {
    return prisma.user.findUnique({
        where: { username },
    })
}
