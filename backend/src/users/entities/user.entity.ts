import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// Register the enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  // password is not exposed in GraphQL for security
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 