export const makeQueryFromArray = (param: string, array: any[]): string => array.map((item) => `${param}[]=${item}`).join('&');

export const objectToQuerystring = (data: Record<string, any>): string => {
    let queryString = '';

    Object.keys(data).forEach((el) => {
        if (data[el] !== undefined && data[el] !== null) {
            if (Array.isArray(data[el])) {
                queryString += `&${makeQueryFromArray(el, data[el])}`;
            } else {
                queryString += `&${el}=${data[el]}`;
            }
        }
    });

    return queryString.slice(1);
};
