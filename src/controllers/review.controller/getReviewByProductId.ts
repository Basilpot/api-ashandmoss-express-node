import { Request, Response } from "express";
import prisma from "@lib/prisma";
import messages from "@/constants/messages.constant";
import { buildPaginationMeta, getPaginationParams } from "@/utils/pagination.util";

export async function getReviewByProductId(req: Request, res: Response){
    const productId = Number(req.params.productId);
    const { page, limit, skip } = getPaginationParams(req);

    const product = await prisma.product.findFirst({
        where: { id: productId }
    })

    if (!product) {
        return res.status(404).json({
            message: messages.dataNotFound 
        })
    }

    const where = { productId: productId };
    const [total, reviews] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({
            where,
            include: {
                product: true,
                reviewer: true,
            },
            skip,
            take: limit,
            orderBy: { id: "asc" },
        })
    ])

    return res.status(200).json({
        message: messages.dataFetched,
        reviews: reviews,
        pagination: buildPaginationMeta(total, page, limit),
    })
}
