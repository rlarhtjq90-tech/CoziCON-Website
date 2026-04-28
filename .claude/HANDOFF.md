# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** (up to date with origin/main)
**created:** 2026-04-28 | **status:** active

## Context
Vercel 배포가 목표였으나 CLI 인증 문제로 완료되지 않았다. Vercel 플러그인은 설치됐으며 Claude Code 재시작 후 플러그인을 통한 배포가 가능하다.

## Immediate Next Steps
- [ ] Claude Code 재시작 → Vercel 플러그인 로드 확인
- [ ] Vercel 플러그인으로 로그인 및 CoziCON-Website 배포
- [ ] 배포 후 vercel.app URL 확인 및 기존 Vercel 프로젝트와 연동 여부 확인

## Active Files
- C:\Users\PC\Desktop\halfdone\projects\brand-website\CoziCON-Website\package.json
- C:\Users\PC\Desktop\halfdone\projects\brand-website\CoziCON-Website\next.config.js

## Current State / Blockers
Vercel CLI 토큰 저장 경로 불일치 문제 (로그인은 완료되나 PowerShell 세션 간 토큰이 공유되지 않음).
Vercel 플러그인(`vercel-plugin@vercel`) 설치 완료 — Claude Code 재시작 필수.
Node.js: `C:\Users\PC\AppData\Local\nodejs\node-v20.19.1-win-x64` (사용자 PATH에 등록됨)
