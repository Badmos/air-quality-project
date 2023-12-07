import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class AirQuality {
  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  aqius: number;

  @Prop({ required: true })
  iqAirDateTime: Date;

  createdAt?: Date;
}

export type AirQualityDocument = AirQuality & Document;
export const AirQualitySchema = SchemaFactory.createForClass(AirQuality);
