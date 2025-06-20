import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Document {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  content: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  mimeType?: string;

  @Field(() => ID)
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 