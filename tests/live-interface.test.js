import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFixture } from './fixture.js';
import { normalizePayroll, studentClasses } from '../src/redesign/format.js';
import { classPayload, validateScheduleRows } from '../src/redesign/schedule.js';

async function serve(t) {
  const fixture = createFixture({ auth: true }); const server = fixture.app.listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); fixture.sqlite.close(); });
  let cookie = '';
  const request = async (path, body) => {
    const r = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type':'application/json', Cookie:cookie }, ...(body ? {body:JSON.stringify(body)} : {}) });
    if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];
    return {status:r.status,data:await r.json()};
  };
  await request('/auth/login',{username:'gv1',password:'kidit'});
  return {...fixture,request};
}
test('live enrollment listing preserves a student in multiple classes',async t=>{
  const {request,sqlite}=await serve(t);
  sqlite.exec("INSERT INTO classes (id,name,schedule) VALUES (2,'Lớp 2','Thứ 5 (17:15 - 19:15)'); INSERT INTO class_students VALUES (2,2,1)");
  const response=await request('/class-enrollments');assert.equal(response.status,200);assert.equal(response.data.length,2);
  assert.equal(studentClasses(1,response.data,[{id:1},{id:2}]).length,2);
});
test('whole-class attendance validates schedule and updates enrolled students only',async t=>{
  const {request,sqlite}=await serve(t);
  assert.equal((await request('/classes/1/attendance/bulk',{date:'2026-10-02'})).status,409);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM attendance').get().n,0);
  const result=await request('/classes/1/attendance/bulk',{date:'2026-10-01'});assert.equal(result.status,200);assert.equal(result.data.count,1);
  assert.deepEqual((await request('/classes/1/attendance?date=2026-10-01')).data,[{student_id:1,status:'present'}]);
});
test('whole-class attendance rolls back every row if a student write fails',async t=>{
  const {request,sqlite,state}=await serve(t);
  sqlite.exec("INSERT INTO students VALUES (2,'Học sinh 2','','',''); INSERT INTO class_students VALUES (2,1,2)");
  state.failAttendanceStudent=2;
  assert.equal((await request('/classes/1/attendance/bulk',{date:'2026-10-01'})).status,500);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM attendance').get().n,0);
  state.failAttendanceStudent=null;
  assert.equal((await request('/classes/1/attendance/bulk',{date:'2026-10-01'})).data.count,2);
});
test('payroll returns draft personal records without counting them as completed work',async t=>{
  const {request}=await serve(t);
  await request('/classes/1/personal-attendance',{date:'2026-10-01',start_time:'15:15',end_time:'17:15',slot:'Thứ 5 (15:15 - 17:15)',lesson:'Bài kiểm thử',role:'teacher',status:'draft',notes:'',version:0});
  const report=(await request('/payroll?month=2026-10')).data;assert.equal(report.rows.length,0);assert.equal(report.entries.length,1);
  const rows=normalizePayroll(report);assert.equal(rows[0].teacherId,1);assert.equal(rows[0].status,'draft');assert.equal(rows[0].entryId,1);
});
test('normalization never double-counts personal payroll or loses historic teacher names',()=>{
  const rows=normalizePayroll({entries:[{id:2,teacher_id:7,teacher_name:'Giáo viên 7',class_id:1,date:'2026-10-01',start_time:'07:00',end_time:'09:00',role:'teacher',status:'completed'}],rows:[{session_id:'personal-2'},{session_id:10,teacher_id:8,teacher_name:'Tên trong công cũ',class_id:1,date:'2026-10-01',start_time:'09:00',end_time:'11:00',role:'ta'}]});
  assert.equal(rows.length,2);assert.equal(rows.find(r=>r.source==='historic').teacherName,'Tên trong công cũ');
});
test('admin quick-create generates unique logins when the username is left empty',async t=>{
  const {request}=await serve(t);await request('/auth/login',{username:'admin',password:'admin'});
  const first=await request('/accounts',{name:'Trùng Tên',password:'kidit',role:1});const second=await request('/accounts',{name:'Trùng Tên',password:'kidit',role:1});
  assert.equal(first.status,200);assert.equal(first.data.username,'trungten');assert.equal(second.status,200);assert.equal(second.data.username,'trungten2');
});
test('class forms preserve unlimited capacity and an unscheduled class',()=>{
  for(const capacity of [null,undefined,''])assert.equal(classPayload({name:'KID 1',scheduleRows:[],capacity}).capacity,null);
  assert.equal(classPayload({name:'KID 1',scheduleRows:[],capacity:'10'}).capacity,10);
  assert.equal(classPayload({name:'KID 1',scheduleRows:[],capacity:null}).schedule,'');
  assert.equal(validateScheduleRows([],{allowEmpty:true}),'');
});
