import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

const PLAYER_SPEED = 300;
const BULLET_SPEED = 500;
const FIRE_COOLDOWN_MS = 220;
const ENEMY_SPEED = 120;
const ENEMY_SPAWN_MS = 800;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };

  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;

  private lastFiredAt = 0;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create(): void {
    this.score = 0;

    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'player');
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 60,
      runChildUpdate: false,
    });

    this.enemies = this.physics.add.group();

    this.enemySpawnTimer = this.time.addEvent({
      delay: ENEMY_SPAWN_MS,
      loop: true,
      callback: this.spawnEnemy,
      callbackScope: this,
    });

    this.scoreText = this.add.text(12, 10, 'SCORE 0', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    });

    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHitsEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, undefined, this);
  }

  update(time: number): void {
    this.handleMovement();
    this.handleShooting(time);
    this.cleanupOffscreen();
  }

  private handleMovement(): void {
    const left = this.cursors.left?.isDown || this.keys.a.isDown;
    const right = this.cursors.right?.isDown || this.keys.d.isDown;

    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }
  }

  private handleShooting(time: number): void {
    const wantsToFire = this.cursors.space?.isDown || this.keys.space.isDown;
    if (!wantsToFire || time < this.lastFiredAt + FIRE_COOLDOWN_MS) {
      return;
    }

    this.lastFiredAt = time;
    const bullet = this.bullets.get(this.player.x, this.player.y - 24, 'bullet') as Phaser.Physics.Arcade.Sprite | null;
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.enableBody(true, this.player.x, this.player.y - 24, true, true);
    bullet.setVelocity(0, -BULLET_SPEED);
  }

  private spawnEnemy(): void {
    const x = Phaser.Math.Between(24, GAME_WIDTH - 24);
    const enemy = this.enemies.create(x, -20, 'enemy') as Phaser.Physics.Arcade.Sprite;
    enemy.setVelocity(0, ENEMY_SPEED);
  }

  private cleanupOffscreen(): void {
    this.bullets.children.each((child) => {
      const bullet = child as Phaser.Physics.Arcade.Sprite;
      if (bullet.active && bullet.y < -20) {
        bullet.disableBody(true, true);
      }
      return true;
    });

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (enemy.active && enemy.y > GAME_HEIGHT + 20) {
        enemy.destroy();
      }
      return true;
    });
  }

  private handleBulletHitsEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, enemyObj) => {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

    bullet.disableBody(true, true);
    enemy.destroy();

    this.score += 10;
    this.scoreText.setText(`SCORE ${this.score}`);
  };

  private handlePlayerHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    this.enemySpawnTimer.remove();
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.time.delayedCall(400, () => {
      this.scene.start('GameOver', { score: this.score });
    });
  };
}
