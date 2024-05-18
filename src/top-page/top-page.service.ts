import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TopLevelCategory, TopPage, TopPageDocument } from './top-page.model';
import { Model } from 'mongoose';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { FindTopPageDto } from './dto/find-top-page.dto';

@Injectable()
export class TopPageService {
  constructor(
    @InjectModel(TopPage.name)
    private readonly topPageModel: Model<TopPageDocument>,
  ) {}

  async create(dto: CreateTopPageDto) {
    return this.topPageModel.create(dto);
  }

  async findById(id: string) {
    return this.topPageModel.findById(id).exec();
  }

  async findByAlias(alias: string) {
    return this.topPageModel.findOne({ alias }).exec();
  }

  async findAll() {
    return this.topPageModel.find({}).exec();
  }

  async findByCategory(firstCategory: TopLevelCategory) {
    return (
      this.topPageModel
        // .find(
        //   { firstCategory },
        //   { alias: 1, secondCategory: 1, title: 1, category: 1 },
        // ) // Старый find без вложенных массивов, упрощающий работу для фронта
        // .aggregate([
        //   {
        //     $match: {
        //       firstCategory,
        //     },
        //   },
        //   {
        //     $group: {
        //       _id: { secondCategory: '$secondCategory' },
        //       pages: { $push: { alias: '$alias', title: '$title' } },
        //     },
        //   },
        // ]) // Первый способ записи метода aggregate
        .aggregate()
        .match({ firstCategory })
        .group({
          _id: { secondCategory: '$secondCategory' },
          pages: { $push: { alias: '$alias', title: '$title' } },
        }) // Второй способ записи метода aggregate
        .exec()
    );
  }

  async findByText(text: string) {
    return this.topPageModel
      .find({ $text: { $search: text, $caseSensitive: false } })
      .exec();
  }

  async deleteById(id: string) {
    return this.topPageModel.findByIdAndDelete(id).exec();
  }

  async updateById(id: string, dto: CreateTopPageDto) {
    return this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }
}
