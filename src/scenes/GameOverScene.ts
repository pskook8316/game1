import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { score?: number }): void {
    const score = data.score ?? 0;
    const centerX = GAME_WIDTH / 2;

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 60, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#ff4f6d',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, GAME_HEIGHT / 2, `SCORE ${score}`, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, GAME_HEIGHT / 2 + 60, 'PRESS SPACE TO RESTART', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#4fd6ff',
      })
      .setOrigin(0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });
  }
}
