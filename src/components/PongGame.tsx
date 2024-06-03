// src/components/PongGame.tsx

import React, { useEffect, useRef } from 'react';

interface Player {
    w: number;
    h: number;
    x: number;
    y: number;
    score: number;
    dv: number;
    speed: number;
    color: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
}

interface Ball {
    r: number;
    x: number;
    y: number;
    w: number;
    color: string;
    top: number;
    bottom: number;
    left: number;
    right: number;
    speed_X: number;
    speed_Y: number;
    speed: number;
    max_speed: number;
    step: number;
}

const PongGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cadreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cvs = canvasRef.current!;
        const ctx = cvs.getContext('2d')!;
        const cadr = cadreRef.current!;

        const hitSound = new Audio('./pong.ogg');
        const ScoreSound = new Audio('./score.ogg');
        let scoreTime = Date.now();
        let currentTime: number;
        let nis = cadr.offsetWidth / 1000;
        cvs.width = cadr.offsetWidth;
        cvs.height = 600 * nis;
        let win_w = 1000;
        let win_h = 600;

        const ball: Ball = {
            r: 15,
            x: 1000 / 2,
            y: 600 / 2,
            w: 30,
            color: 'WHITE',
            get top() {
                return this.y - this.r;
            },
            get bottom() {
                return this.y + this.r;
            },
            get left() {
                return this.x - this.r;
            },
            get right() {
                return this.x + this.r;
            },
            speed_X: -5,
            speed_Y: 0,
            speed: 5,
            max_speed: 23,
            step: 0.5,
        };

        const user1: Player = {
            w: 15,
            h: 150,
            x: 5,
            y: 600 / 2 - 150 / 2,
            score: 0,
            dv: 0,
            speed: 10,
            color: '#C322FF',
            get top() {
                return this.y;
            },
            get left() {
                return this.x;
            },
            get right() {
                return this.x + this.w;
            },
            get bottom() {
                return this.y + this.h;
            },
        };

        const user2: Player = {
            w: 15,
            h: 150,
            x: 1000 - 15 - 5,
            y: 600 / 2 - 150 / 2,
            score: 0,
            dv: 0,
            speed: 10,
            color: '#0AC9FC',
            get top() {
                return this.y;
            },
            get left() {
                return this.x;
            },
            get right() {
                return this.x + this.w;
            },
            get bottom() {
                return this.y + this.h;
            },
        };

        const drawPlayer = (obj: Player) => {
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x * nis, obj.y * nis, obj.w * nis, obj.h * nis);
        };

        const drawBall = (obj: Ball) => {
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x * nis, obj.y * nis, obj.r * nis, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        };

        const drawNit = () => {
            ctx.fillStyle = 'WHITE';
            ctx.fillRect(win_w * nis / 2, 0, 1 * nis, win_h * nis);
        };

        const drawText = (x: number, y: number, text: string | number, color: string) => {
            ctx.fillStyle = color;
            ctx.font = nis * 50 + 'px Arial';
            ctx.fillText(text.toString(), x * nis, y * nis);
        };

        const collision = (b: Ball, p: Player) => {
            return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
        };

        const playHitSound = () => {
            hitSound.currentTime = 0;
            hitSound.play();
        };

        const scoreCheck = () => {
            if (ball.left <= 0) {
                scoreTime = Date.now();
                ScoreSound.play();
                user2.score++;
            }
            if (ball.right >= win_w) {
                ScoreSound.play();
                scoreTime = Date.now();
                user1.score++;
            }
        };

        const ballAnimation = () => {
            ball.x += ball.speed_X;
            ball.y += ball.speed_Y;
            if (ball.top <= 0) {
                ball.y = ball.r;
                ball.speed_Y *= -1;
            } else if (ball.bottom >= win_h) {
                ball.y = win_h - ball.r;
                ball.speed_Y *= -1;
            }

            scoreCheck();

            let player: Player;
            if (ball.x > win_w / 2) player = user2;
            else player = user1;

            if (collision(ball, player)) {
                playHitSound();
                if ((Math.abs(ball.right - player.left) < ball.w && ball.speed_X > 0) || (Math.abs(ball.left - player.right) < ball.w && ball.speed_X < 0)) {
                    let collidePoint = ball.y - (player.y + player.h / 2);
                    collidePoint = collidePoint / (player.h / 2);
                    let angleRad = collidePoint * (Math.PI / 4);

                    let dir: number;
                    let dir2: number;
                    if (ball.left > win_w / 2) {
                        dir2 = -1;
                        dir = -1;
                    } else {
                        dir2 = 1;
                        dir = 1;
                    }
                    ball.speed_X = dir * ball.speed * Math.cos(angleRad);
                    ball.speed_Y = dir * ball.speed * Math.sin(angleRad) * dir2;
                    if (ball.speed < ball.max_speed) ball.speed += ball.step;
                } else if (Math.abs(ball.bottom - player.top) < ball.w && ball.speed_Y > 0) {
                    ball.speed_Y *= -1;
                } else if (Math.abs(ball.top - player.bottom) < ball.w && ball.speed_Y < 0) ball.speed_Y *= -1;
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'w' || event.key === 'W') {
                user1.dv = -user1.speed;
            } else if (event.key === 's' || event.key === 'S') {
                user1.dv = user1.speed;
            }
            if (event.key === 'ArrowUp' || event.key === 'Up') {
                user2.dv = -user2.speed;
            } else if (event.key === 'ArrowDown' || event.key === 'Down') {
                user2.dv = user2.speed;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
                user1.dv = 0;
            }
            if (event.key === 'ArrowUp' || event.key === 'Up' || event.key === 'ArrowDown' || event.key === 'Down') {
                user2.dv = 0;
            }
        };

        const eventCheck = () => {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
        };

        const playersAnimation = () => {
            user1.y += user1.dv;
            if (user1.top <= 0) user1.y = 0;
            else if (user1.bottom >= win_h) user1.y = win_h - user1.h;
            user2.y += user2.dv;
            if (user2.top <= 0) user2.y = 0;
            else if (user2.bottom >= win_h) user2.y = win_h - user2.h;
        };

        const RandomDir = () => {
            return Math.random() < 0.5 ? -1 : 1;
        };

        const countDown = (elapsed: number) => {
            if (elapsed < 1000) drawText(win_w / 2 - 15, win_h / 2 + 60, '3', 'RED');
            else if (elapsed < 2000) drawText(win_w / 2 - 15, win_h / 2 + 60, '2', 'RED');
            else if (elapsed < 3000) drawText(win_w / 2 - 15, win_h / 2 + 60, '1', 'RED');
        };

        const ballRestart = () => {
            let elapsed = currentTime - scoreTime;
            ball.x = 1000 / 2;
            ball.y = 600 / 2;

            countDown(elapsed);

            if (elapsed < 3000) {
                ball.speed_X = 0;
                ball.speed_Y = 0;
            } else {
                ball.speed = 5;
                ball.speed_X = ball.speed * RandomDir();
                ball.speed_Y = 0;
                scoreTime = 0;
            }
        };

        const drawBackGround = () => {
            ctx.fillStyle = 'BLACK';
            ctx.fillRect(0, 0, win_w * nis, win_h * nis);
        };

        const init = () => {
            nis = cadr.offsetWidth / 1000;
            cvs.width = cadr.offsetWidth;
            cvs.height = 600 * nis;
            currentTime = Date.now();
        };

        const render = () => {
            ctx.clearRect(0, 0, win_w, win_h);
            drawBackGround();
            drawNit();
            drawPlayer(user1);
            drawPlayer(user2);
            drawText(win_w / 2 - 55, 50, user1.score, 'WHITE');
            drawText(win_w / 2 + 30, 50, user2.score, 'WHITE');
            drawBall(ball);
        };

        const update = () => {
            if (scoreTime) ballRestart();
            ballAnimation();
            playersAnimation();
        };

        const game = () => {
            init();
            eventCheck();
            render();
            update();
        };

        const intervalId = setInterval(game, 1000 / 60);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div ref={cadreRef} id="cadre" style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef} id="pong"></canvas>
        </div>
    );
};

export default PongGame;
