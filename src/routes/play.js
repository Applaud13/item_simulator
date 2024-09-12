import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import jwttoken from '../middlewares/auth.middleware.js';
import joi from 'joi';
import bcrypt from 'bcrypt';


const router = express.Router();


// 아이템 구입
router.get("/shop/:characterid/:equipitemid", jwttoken, async(req, res, next) => {
    try{

        const {characterid, equipitemid} = req.params;

        // 유효한 아이템 id가 맞는지 확인
        const item = await prisma.EquipItem.findFirst({
            where: {equipitemid: +equipitemid}
        });
        if(!item){
            return res.status(404).json({Messag: "존재하지 않는 아이템id 입니다."});
        };

        // 유효한 캐릭터 id가 맞는지 확인
        const character = await prisma.Characters.findFirst({
            where: {characterid: +characterid},
            include: { inventory: true }
        });
        if(!character){
            return res.status(404).json({Messag: "존재하지 않는 캐릭터id 입니다."});
        };

        // 로그인한 플레이어의 캐릭터가 맞는지 확인
        const token = req.cookies.authorization.split(" ")[1];
        const decodectoken = jwt.verify(token, "mysecretkey");
        const playerid = decodectoken.playerid;
        if(character.playerid!==playerid){
            return res.status(400).json({Messag: "자신의 캐릭터로만 구매할 수 있습니다."});
        };
        
        // 캐릭터의 골드가 충분한지 확인
        if(character.money < item.money){
            return res.status(400).json({Message: `골드가 ${item.money - character.money }원 부족합니다.`});
        };

        // 다른 캐릭터에게 속한 아이템인지 확인
        if(item.inventoryid){
            return res.status(400).json({Message: "이미 주인이 존재하는 아이템입니다."})
        };

        // 아이템 구입 실행 (1. 캐릭터의 인벤토리로 보내기 2. 캐릭터의 골드 차감하기)
        const inventoryid = character.inventory.inventoryid;
        await prisma.EquipItem.update({
            where: {equipitemid: +equipitemid},
            data: {inventoryid: inventoryid}
        });
        await prisma.Characters.update({
            where: {characterid: +characterid},
            data: {money: character.money - item.money}
        });

        return res.status(200).json({Message: `${item.itemname} 구입에 성공하였습니다!`});

    }catch(error){
        next(error);
    }
})




export default router;