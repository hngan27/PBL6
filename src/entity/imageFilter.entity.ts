import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ImageFilter {
  @PrimaryGeneratedColumn('uuid')
  filter_id: string;

  @Column({ length: 255 })
  image_url: string;

  @Column({ default: false })
  is_sensitive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  checked_at: Date;
}
