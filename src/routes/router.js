import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import joi from 'joi';
import jwttoken from '../middlewares/auth.middleware.js';


const router = express.Router();
const idschema = joi.object({
    id: joi.string().pattern(/(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/).min(2).max(20).required()
})
const passwordschema = joi.object({
    password: joi.string().min(6).max(20).required()
})
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


// 계정 생성
router.post("/sign-up", async(req, res, next) => {
    try{

        const {id, password, passwordconfirm, name, age} = req.body;
        const {error: iderror} = idschema.validate({id});
        if(iderror){
            return res.status(400).json({Message: "id는 2자이상 20자이하의 영어 소문자 + 숫자 조합으로 구성이 되어야 합니다."})
        }
        const {error: passworderror} = passwordschema.validate({password});
        if(passworderror){
            return res.status(400).json({Message:"비밀번호는 최소 6자 이상 최대 20자 이하 이어야 합니다."})
        }
        
        const duplication = await prisma.Players.findFirst({
            where : {id: id}
        })
        if(duplication){
            return res.status(409).json({Message: "이미 존재하는 id입니다."});
        }

        if(password!==passwordconfirm){
            return res.status(401).json({Message: "비밀번호가 서로 다릅니다."});
        } 

        if (name && (name.length > 3 || name.length < 2)) {
            return res.status(409).json({ Message: "올바른 이름을 입력해주세요." });
        }

        if (age && (age > 100 || age < 3)) {
            return res.status(409).json({ Message: "올바른 나이를 입력해주세요." });
        }
        
        const hashedpassword = await bcrypt.hash(password, 10);

        await prisma.Players.create({
            data: {
                id: id,
                password: hashedpassword,
                name: name,
                age: age
            }
        });

        return res.status(201).json({Message: "계정이 성공적으로 생성되었습니다!"});

    }catch(error){
        next(error);
    }
})


// 단일 계정 상세 조회
router.get("/Player/:playerid", async(req, res, next) => {
    try{

        const {playerid} = req.params;
        const player = await prisma.Players.findUnique({
            where: {playerid: +playerid},
            select: {
                playerid: true,
                id: true,
                password: true,
                name: true,
                age: true,
                createdAt: true,
                updatedAt: true,
                characters: {
                    select: {
                        characterid: true,
                        playerid: false,
                        name: true,
                        hp: true,
                        attackpower: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        if(!player){
            return res.status(404).json({Message: "존재하지 않는 계정번호입니다."});
        };

        return res.status(200).json({player});

    }catch(error){
        next(error);
    }
})


// 모든 계정 조회
router.get("/Player", async(req, res, next) => {
    try{
        
        const players = await prisma.Players.findMany({
            select: {
                playerid: true,
                id: true,
                password: false,
                name: false,
                age: false,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({players})

    }catch(error){
        next(error);
    }
})


// 계정 로그인
router.post("/sign-in", async(req, res, next) => {
    try{

        const {id, password} = req.body;

        const player = await prisma.Players.findUnique({
            where: {id: id}
        })
        if(!player){
            return res.status(404).json({Message: "id를 확인해주세요."})
        }

        const same = await bcrypt.compare(password, player.password);
        if(!same){
            return res.status(401).json({Message: "비밀번호를 확인해주세요."})
        }

        const token = jwt.sign({playerid: player.playerid}, 'mysecretkey');

        res.cookie('authorization', `Bearer ${token}`);

        return res.status(200).json({Message: "로그인에 성공하였습니다!"})

    }catch(error){
        next(error);
    }
})


// 캐릭터 생성
router.post("/Character", jwttoken, async(req, res,next) => {
    try{

        const {name} = req.body;

        const duplication = await prisma.Characters.findFirst({
            where: {name: name}
        })
        if(duplication){
            return res.status(409).json({Message: "이미 존재하는 캐릭터 이름입니다."});
        }
        
        const token = req.cookies.authorization.split(" ")[1];
        const decodectoken = jwt.verify(token, "mysecretkey");
        const playerid = decodectoken.playerid;

        const character = await prisma.Characters.create({
            data: {
                name: name,
                playerid: playerid
            }
        })

        return res.status(201).json({Message: `${name} 캐릭터가 생성되었습니다! 캐릭터ID(${character.characterid})`})

    }catch(error){
        next(error);
    }
})


// 캐릭터 삭제
router.delete("/Character/:characterid", jwttoken, async(req, res, next) => {
    try{

        const {characterid} = req.params;
    
        const Character = await prisma.Characters.findFirst({
            where: {characterid: +characterid}
        })
        if(!Character){
            return res.status(404).json({Messag: "존재하지 않는 캐릭터id입니다."})
        }

        const token = req.cookies.authorization.split(" ")[1];
        const decodectoken = jwt.verify(token, "mysecretkey");
        const playerid = decodectoken.playerid;
        
        if(playerid!==Character.playerid){
            return res.status(409).json({Message: "다른 플레이어의 캐릭터를 삭제할 수 없습니다."})
        }

        const deletedCharacter = await prisma.Characters.delete({
            where: { characterid: +characterid }
        });

        return res.status(200).json({Message: `${deletedCharacter.name} 캐릭터가 삭제되었습니다.`})

    }catch(error){
        next(error);
    }
})


// 캐릭터 상세 조회
router.get("/Character/:characterid", async(req, res, next) => {
    try{

        const {characterid} = req.params;
        let character = await prisma.Characters.findFirst({
            where: {characterid: +characterid}
        })
        if(!character){
            return res.status(404).json({Messag: "존재하지 않는 캐릭터id입니다."})
        }

        const token = req.cookies.authorization.split(" ")[1];
        const decodectoken = jwt.verify(token, "mysecretkey");
        const playerid = decodectoken.playerid;
        let my = false;
        if(playerid===character.playerid){
            my = true;
        }

        character = await prisma.Characters.findFirst({
            where: {characterid: +characterid},
            select: {
                characterid: false,
                playerid: false,
                name: true,
                hp: true,
                attackpower: true,
                money: my,
                createdAt: false,
                updatedAt: false
            }
        })

        return res.status(200).json({character})

    }catch(error){
        next(error);
    }
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