import { Test, TestingModule } from '@nestjs/testing';
import { ConferencesService } from './conference.service';

describe('FestivalsService', () => {
  let service: ConferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConferencesService],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
