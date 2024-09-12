👨‍🏫  인섬니아 명령어 모음 👨‍🏫<br>
1. **계정 생성**<br>
    POST 52.78.206.210:3018/api/sign-up<br>
	"id": "사용할 ID",<br>
	"password": "사용할 비밀번호",<br>
	"passwordconfirm": "사용할 비밀번호"<br>

2. **모든 계정 조회**<br>
    GET 52.78.206.210:3018/api/Player<br>

3. **계정 상세 조회**<br>
    GET 52.78.206.210:3018/api/Player/:playerid<br>

4. **계정 로그인**<br>
    GET 52.78.206.210:3018/api/sign-in<br>
	"id": "보유한 ID",<br>
	"password": "보유한 비밀번호"<br>

5. **캐릭터 생성**<br>
    POST 52.78.206.210:3018/api/Character<br>
	"name": "사용할 캐릭터 명칭"<br>

6. **캐릭서 상세 조회**<br>
    GET 52.78.206.210:3018:3018/api/Character/:characterid<br>

7. **캐릭서 삭제**<br>
    DELETE 52.78.206.210:3018:3018/api/Character/:characterid<br>

8. **아이템 생성**<br>
    POST 52.78.206.210:3018:3018/api/item<br>
    "name": "아이템 명칭",<br>
    "money": 가격,<br>
	"itemstat": {<br>
	"health": 체력 스탯,<br>
	"attackpower": 공격력 스탯}<br>
    
9. **아이템 수정**<br>
    POST 52.78.206.210:3018:3018/api/:equipitemid<br>
    "name": "아이템 명칭",<br>
	"itemstat": {<br>
	"health": 체력 스탯,<br>
	"attackpower": 공격력 스탯}<br>

10. **모든 아이템 조회**<br>
    GET 52.78.206.210:3018:3018/api/item<br>

11. **아이템 상세 조회**<br>
    GET 52.78.206.210:3018:3018/api/item/:equipitemid<br>
    
12. **아이템 구입**<br>
    52.78.206.210:3018:3018/api/shop/:equipitemid<br>
    "equipitemid": 구매할 아이템id,<br>
	"count": 수량<br>


