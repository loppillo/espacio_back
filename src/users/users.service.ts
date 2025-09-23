import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { name, password, profileImage } = createUserDto;
  
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        profileImage,
      });
  
      return await this.userRepository.save(newUser);
    } catch (error) {
      // Manejo de errores si falla la creación del usuario
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  } 

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({id});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id,updateUserDto);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }
   async createUser(name: string, password: string, role?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, password: hashedPassword, role });
    return this.userRepository.save(user);
  }

  async findByUsername(name: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { name } });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}


