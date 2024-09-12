import express from "express";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import jwttoken from "../middlewares/auth.middleware.js";

const router = express.Router();

// 캐릭터 생성
router.post("/Character", jwttoken, async (req, res, next) => {
  try {
    const { name } = req.body;

    const duplication = await prisma.Characters.findFirst({
      where: { name: name },
    });
    if (duplication) {
      return res
        .status(409)
        .json({ Message: "이미 존재하는 캐릭터 이름입니다." });
    }

    const token = req.cookies.authorization.split(" ")[1];
    const decodectoken = jwt.verify(token, "mysecretkey");
    const playerid = decodectoken.playerid;

    const character = await prisma.Characters.create({
      data: {
        name: name,
        playerid: playerid,
      },
    });

    await prisma.inventory.create({
      data: {
        characterid: character.characterid,
      },
    });

    await prisma.CharacterItem.create({
      data: {
        characterid: character.characterid,
      },
    });

    return res
      .status(201)
      .json({
        Message: `${name} 캐릭터가 생성되었습니다! 캐릭터ID(${character.characterid})`,
      });
  } catch (error) {
    next(error);
  }
});

// 캐릭터 삭제
router.delete("/Character/:characterid", jwttoken, async (req, res, next) => {
  try {
    const { characterid } = req.params;

    const Character = await prisma.Characters.findFirst({
      where: { characterid: +characterid },
    });
    if (!Character) {
      return res.status(404).json({ Messag: "존재하지 않는 캐릭터id입니다." });
    }

    const token = req.cookies.authorization.split(" ")[1];
    const decodectoken = jwt.verify(token, "mysecretkey");
    const playerid = decodectoken.playerid;

    if (playerid !== Character.playerid) {
      return res
        .status(409)
        .json({ Message: "다른 플레이어의 캐릭터를 삭제할 수 없습니다." });
    }

    const deletedCharacter = await prisma.Characters.delete({
      where: { characterid: +characterid },
    });

    return res
      .status(200)
      .json({ Message: `${deletedCharacter.name} 캐릭터가 삭제되었습니다.` });
  } catch (error) {
    next(error);
  }
});

// 캐릭터 상세 조회
router.get("/Character/:characterid", async (req, res, next) => {
  try {
    const { characterid } = req.params;
    let character = await prisma.Characters.findFirst({
      where: { characterid: +characterid },
    });
    if (!character) {
      return res.status(404).json({ Messag: "존재하지 않는 캐릭터id입니다." });
    }

    let my = false;
    const authorization = req.cookies.authorization;
    if (authorization) {
      const token = req.cookies.authorization.split(" ")[1];
      const decodectoken = jwt.verify(token, "mysecretkey");
      const playerid = decodectoken.playerid;
      if (playerid === character.playerid) {
        my = true;
      }
    }

    character = await prisma.Characters.findFirst({
      where: { characterid: +characterid },
      select: {
        characterid: false,
        playerid: false,
        name: true,
        hp: true,
        attackpower: true,
        money: my,
        createdAt: false,
        updatedAt: false,
      },
    });

    return res.status(200).json({ character });
  } catch (error) {
    next(error);
  }
});

export default router;
