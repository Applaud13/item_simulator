import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import joi from 'joi';
import jwttoken from '../middlewares/auth.middleware.js';


const router = express.Router();


const itemstatschema = joi.object({
    health: joi.number().optional(),
    attackpower: joi.number().optional()
})
const itemnameschema = joi.object({
    name: joi.string().min(1).max(20).required()
})
const moneyschema = joi.object({
    money: joi.number().min(0).max(100000000).required()
})


// 아이템 생성
router.post("/item", jwttoken, async(req, res, next) => {
    try{

        const {name, money, itemstat} = req.body;

        const {error: staterror} = itemstatschema.validate(itemstat);
        if (staterror) {
            return res.status(400).json({Message: "스탯은 숫자로 기입해야하며 health, attackpower 중 선택 기입사항입니다."});
        }

        const {error: nameerror} = itemnameschema.validate({name: name});
        if (nameerror) {
            return res.status(400).json({Message: "아이템 명칭은 1자이상 20자이하로 필수 기입사항입니다."});
        }

        const {error: moneyerror} = moneyschema.validate({money: money});
        if (moneyerror) {
            return res.status(400).json({Message: "아이템 가격은 1억이하의 숫자로 필수 기입사항입니다."});
        }

        const item = await prisma.EquipItem.create({
            data: {
                itemname: name,
                money: +money,
                itemstat: itemstat
            },
            select: {
                equipitemid: true,
                itemname: true,
                characteritemid: false,
                inventoryid: false,
                money: true,
                createdAt: false,
                updatedAt: false,
                itemstat: true
            }
        })

        return res.status(201).json({item})

    }catch(error){
        next(error);
    }
})


// 아이템 수정
router.patch("/item/:equipitemid", jwttoken, async(req, res, next) => {
    try{

        const {equipitemid} = req.params;
        const {name, itemstat} = req.body;

        const item = await prisma.EquipItem.findFirst({
            where: {equipitemid: +equipitemid}
        })
        if(!item){
            return res.status(404).json({Message: "존재하지 않는 아이템id입니다."})
        }

        const {error: staterror} = itemstatschema.validate(itemstat);
        if (staterror) {
            return res.status(400).json({Message: "스탯은 숫자로 기입해야하며 health, attackpower 중 선택 기입사항입니다."});
        }

        const {error: nameerror} = itemnameschema.validate({name: name});
        if (nameerror) {
            return res.status(400).json({Message: "아이템 명칭은 1자이상 20자이하로 필수 기입사항입니다."});
        }

        const updatedItem = await prisma.EquipItem.update({
            where: {
                equipitemid: +equipitemid
            },
            data: {
                itemname: name,
                itemstat: itemstat
            },
            select: {
                equipitemid: false,
                itemname: true,
                characteritemid: false,
                inventoryid: false,
                money: false,
                createdAt: false,
                updatedAt: false,
                itemstat: true
            }
        });
        
        return res.status(200).json({updatedItem})

    }catch(error){
        next(error);
    }
})


// 모든 아이템 조회
router.get("/item", async(req, res, next) => {
    try{ 

        const items = await prisma.EquipItem.findMany({
            select: {
                equipitemid: true,
                characteritemid: false,
                itemname: true,
                inventoryid: false,
                itemstat: false,
                money: true,
                createdAt: false,
                updatedAt: false,
            }
        })

        return res.status(200).json({items})

    }catch(error){
        next(error)
    }
})


// 아이템 상세 조회
router.get("/item/:equipitemid", async(req, res, next) => {
    try{
        
        const {equipitemid} = req.params;
        const item = await prisma.EquipItem.findFirst({
            where: {equipitemid: +equipitemid},
            select: {
                equipitemid: true,
                itemname: true,
                characteritemid: false,
                inventoryid: false,
                createdAt: false,
                updatedAt: false,
                itemstat: true,
                money: true
            }
        })

        return res.status(200).json({item})

    }catch(error){
        next(error);
    }
})


export default router;