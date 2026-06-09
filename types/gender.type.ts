
export interface IGenderResponse {  
    data: IGender;
}


export interface IGender {
    is_show: boolean;
    description: string;
    gender_display: string;
    items: IGenderItem[];
}

export interface IGenderItem {
    title: string;
    value: string;
    is_selected: boolean;
}