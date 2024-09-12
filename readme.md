👨‍🏫  인섬니아 명령어 모음 👨‍🏫
1. 계정 생성<br>
    POST 52.78.206.210:3018/api/sign-up<br>
    {<br>
	"id": "사용할 ID",<br>
	"password": "사용할 비밀번호",<br>
	"passwordconfirm": "사용할 비밀번호"<br>
    }<br>

2. 모든 계정 조회<br>
    GET 52.78.206.210:3018/api/Player<br>

3. 계정 상세 조회<br>
    GET 52.78.206.210:3018/api/Player/:playerid<br>

4. 계정 로그인<br>
    GET 52.78.206.210:3018/api/sign-in<br>
    {<br>
	"id": "보유한 ID",<br>
	"password": "보유한 비밀번호"<br>
    }<br>

5. 캐릭터 생성<br>
    52.78.206.210:3018/api/Character<br>
    {<br>
	"name": "사용할 캐릭터 명칭"<br>
    }<br>


