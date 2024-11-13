import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';

const paddleWidth = 100; // širina palice
const paddleHeight = 10; // visina palice
const ballRadius = 10; // radijus lopte
const brickRowCount = 5; // broj redova cigli
const brickColumnCount = 5; // broj stupaca cigli
const brickWidth = 75; // širina cigle
const brickHeight = 20; // visina cigle
const brickPadding = 10; // razmak između cigli
const brickOffsetTop = 30; // početni razmak od vrha ekrana

const Game = () => {
  // Stanja igre
  const [score, setScore] = useState(0); // trenutni rezultat
  const [highScore, setHighScore] = useState(localStorage.getItem('highScore') || 0); // najbolji rezultat
  const [gameOver, setGameOver] = useState(false); // stanje igre, ako je gotova
  const [paddleX, setPaddleX] = useState(window.innerWidth / 2 - paddleWidth / 2); // pozicija palice
  const [ballPosition, setBallPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 30 }); // pozicija lopte
  const [ballDirection, setBallDirection] = useState({ dx: 2, dy: -2 }); // smjer kretanja lopte
  const [bricks, setBricks] = useState(initializeBricks()); // inicijalizacija cigli

  // Funkcija za inicijalizaciju cigli
  function initializeBricks() {
    const newBricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      newBricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        newBricks[c][r] = { x: 0, y: 0, status: 1 }; // cigla je inicijalno postavljena na 'aktivnu'
      }
    }
    return newBricks;
  }

  // Funkcija za resetiranje igre
  const resetGame = () => {
    setScore(0); // resetiranje rezultata
    setGameOver(false); // postavljanje igre na aktivnu
    setPaddleX(window.innerWidth / 2 - paddleWidth / 2); // postavljanje početne pozicije palice
    setBallPosition({ x: window.innerWidth / 2, y: window.innerHeight - 30 }); // postavljanje početne pozicije lopte

    // Generiranje nasumičnog kuta za smjer lopte
    const randomAngle = Math.random() * Math.PI / 4 - Math.PI / 8; // nasumičan kut između -22.5° i 22.5°
    const newDx = Math.sin(randomAngle) * 4; // x-brzina na temelju kuta
    const newDy = -Math.cos(randomAngle) * 4; // y-brzina (negativna da ide prema gore)
    setBallDirection({ dx: newDx, dy: newDy });
    setBricks(initializeBricks()); // ponovno inicijaliziraj cigle
    
    // Zvuk za početak igre
    document.getElementById('gameStart').play();
  };

  // Provjera jesu li sve cigle uništene
  const checkAllBricksDestroyed = () => {
    return bricks.every(column => column.every(brick => brick.status === 0));
  };

  // Funkcija za crtanje na canvasu
  const draw = (ctx) => {
    // Očisti canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
    // Postavljanje sjenčanja za palicu
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  
    // Iscrtavanje palice (crveni pravokutnik)
    ctx.fillStyle = 'red';
    ctx.fillRect(paddleX, window.innerHeight - paddleHeight - 10, paddleWidth, paddleHeight);
  
    // Resetiranje sjenčanja za druge objekte
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  
    // Iscrtavanje loptice
    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  
    // Izračun horizontalnog offset-a da bi cigle bile centrirane
    const totalBrickWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (window.innerWidth - totalBrickWidth) / 2;
  
    // Iscrtavanje cigli s sjenčanjem
    bricks.forEach((column, cIdx) => {
      column.forEach((brick, rIdx) => {
        if (brick.status === 1) { // Ako je cigla aktivna
          const x = offsetX + cIdx * (brickWidth + brickPadding);
          const y = rIdx * (brickHeight + brickPadding) + brickOffsetTop;
          brick.x = x;
          brick.y = y;
  
          // Postavljanje sjenčanja za ciglu
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  
          ctx.fillStyle = 'blue';
          ctx.fillRect(x, y, brickWidth, brickHeight);
  
          // Resetiranje sjenčanja nakon iscrtavanja cigle
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }
      });
    });
  };

  // Funkcija za provjeru sudara s palicom
  const checkPaddleCollision = () => {
    if (
        ballPosition.y + ballRadius > window.innerHeight - paddleHeight - 10 &&
        ballPosition.x > paddleX &&
        ballPosition.x < paddleX + paddleWidth
        ) {
        const paddleCenter = paddleX + paddleWidth / 2;
        const ballHitPosition = ballPosition.x - paddleCenter;
        const angle = (ballHitPosition / (paddleWidth / 2)) * Math.PI / 4;
        const newDx = Math.sin(angle) * 4;
        const newDy = -Math.cos(angle) * 4;

        setBallDirection({ dx: newDx, dy: newDy });

        // Zvuk kada loptica pogodi palicu
        document.getElementById('collisionPaddle').play();
      }
  };

  // Funkcija za provjeru sudara s ciglama
  const checkBrickCollisions = () => {
    bricks.forEach((column, cIdx) => {
      column.forEach((brick, rIdx) => {
        if (brick.status === 1) { // Provjera ako je cigla aktivna
          if (
            ballPosition.x > brick.x &&
            ballPosition.x < brick.x + brickWidth &&
            ballPosition.y > brick.y &&
            ballPosition.y < brick.y + brickHeight
          ) {
            const newBricks = [...bricks];
            newBricks[cIdx][rIdx].status = 0; // cigla je razbijena
            setBricks(newBricks);
            setScore((prev) => prev + 1);

            // Zvuk kada loptica pogodi ciglu
            document.getElementById('collisionBrick').play();

            // Promijeni smjer lopte
            setBallDirection((prev) => ({ ...prev, dy: -prev.dy }));

            if (checkAllBricksDestroyed()) {
                setGameOver(true); 
                document.getElementById('gameOver').play();
              }
          }
        }
      });
    });
  };

  // Funkcija za ažuriranje pozicije lopte
  const updateBallPosition = () => {
    let newBallX = ballPosition.x + ballDirection.dx;
    let newBallY = ballPosition.y + ballDirection.dy;

    // Provjera sudara s lijevim i desnim rubom ekrana
    if (newBallX + ballRadius > window.innerWidth) {
      newBallX = window.innerWidth - ballRadius; // Spriječava da loptica ide izvan ruba ekrana
      setBallDirection((prev) => ({ ...prev, dx: -prev.dx }));
      document.getElementById('collisionWall').play();
    } else if (newBallX - ballRadius < 0) {
      newBallX = ballRadius; // Spriječava da loptica ide izvan ruba ekrana
      setBallDirection((prev) => ({ ...prev, dx: -prev.dx }));
      document.getElementById('collisionWall').play();
    }

    // Provjera sudara s gornjim rubom
    if (newBallY - ballRadius < 0) {
      newBallY = ballRadius; // Spriječava da loptica ide izvan ruba ekrana
      setBallDirection((prev) => ({ ...prev, dy: -prev.dy }));
      document.getElementById('collisionWall').play();
    }

    // Provjera sudara s donjim rubom (game over)
    if (newBallY + ballRadius > window.innerHeight) {
      setGameOver(true); 
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('highScore', score);
      }
      document.getElementById('gameOver').play();
    }

    // Ažuriraj poziciju loptice
    setBallPosition({ x: newBallX, y: newBallY });
};

  useEffect(() => {
    const handleResize = () => {
      // Ažuriraj širinu i visinu kada se prozor promijeni
      setPaddleX(window.innerWidth / 2 - paddleWidth / 2);
      setBallPosition({ x: window.innerWidth / 2, y: window.innerHeight - 30 });
    };

    window.addEventListener('resize', handleResize);

    // Čišćenje listenera prilikom unmount-a
    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && paddleX < window.innerWidth - paddleWidth) {
        setPaddleX((prev) => prev + 20);
      } else if (e.key === 'ArrowLeft' && paddleX > 0) {
        setPaddleX((prev) => prev - 20);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paddleX]);

  useEffect(() => {
    if (gameOver) return; // Ako je gameOver true, ne pokrećemo petlju
  
    const gameLoop = setInterval(() => {
      updateBallPosition();
      checkPaddleCollision();
      checkBrickCollisions();
    }, 16); // ~60 FPS
  
    return () => clearInterval(gameLoop); // Čišćenje intervala pri promjeni
  }, [ballPosition, paddleX, bricks, gameOver]);

  return (
    <div>
      {/* Canvas komponenta za crtanje */}
      <Canvas draw={draw} />
      
      {/* Scoreboard u gornjem desnom kutu */}
      <div id="scoreBoard">
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>
      
      {/* Game Over ekran u centru */}
      {gameOver && (
        <div id="gameOverScreen">
          <p id="gameOverMessage">
            {checkAllBricksDestroyed() ? "YOU WON!" : "GAME OVER"}
          </p>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default Game;
