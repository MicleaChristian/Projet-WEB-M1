import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Document {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  mimeType?: string;

  @Field(() => ID)
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 