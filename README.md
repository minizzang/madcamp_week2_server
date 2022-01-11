# 빌리지(Village) - Backend
- Backend : Node.js, express
- Database : mysql
- Frontend 관련 정보는 [여기](https://github.com/minizzang/madcamp_week2)에서 확인해주세요.


## Backend
  - 빌리지(Village) 앱 요청을 처리하기 위해 api 요청으로 get, post method를 이용했습니다.
  - 앱 내의 채팅 기능을 구현하기 위해 socket.io를 이용한 통신을 이용했습니다.

## Database
  - 빌리지(Village) 앱을 위한 Database 구축
  > ### Database Tables
   - Database table schema는 [여기](https://github.com/minizzang/madcamp_week2_server/blob/main/db)를 참고해주세요.
   - Table List
     - users : 가입한 사용자 정보
     - items : 등록한 물건 정보
     - contracts : 사용자 간 물건 빌리기 체결 정보
     - chatting_room : 사용자 간 생성된 채팅 방 정보
     - chatting_message : 앱 내의 모든 채팅 기록 
