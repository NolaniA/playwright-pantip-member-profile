export interface IBirthDayResponse {
  birthday: IBirthday;
}

export interface IBirthday {
  is_show: boolean;
  iso_date: string;
  description: string;
  birthday_display: string;
  show_condition_items: IShowConditionItem[];
}

export interface IShowConditionItem {
  title: string;
  value: number;
  selected: boolean;
}