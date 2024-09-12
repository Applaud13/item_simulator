import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const router = express.Router();
const idschema = joi.object({
    id: joi.string().pattern(/(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/).min(2).max(20).required()
})
const passwordschema = joi.object({
    password: joi.string().min(6).max(20).required()
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


export default router;