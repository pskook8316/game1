import Phaser from 'phaser';

/**
 * Week 1 프로토타입: 외부 아트 에셋 대신 도형으로 텍스처를 생성한다.
 * Week 3에서 실제 스프라이트로 교체 예정.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    const g = this.add.graphics();

    g.fillStyle(0x4fd6ff, 1);
    g.fillTriangle(16, 0, 0, 32, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();

    g.fillStyle(0xff4f6d, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('enemy', 28, 28);
    g.clear();

    g.fillStyle(0xffe066, 1);
    g.fillRect(0, 0, 4, 12);
    g.generateTexture('bullet', 4, 12);
    g.clear();

    g.destroy();

    this.scene.start('Game');
  }
}
