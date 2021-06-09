export const generateResult = () => {
    const red1 = (Math.random() * 2) >> 0 !== 0;
    const red2 = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3 <= 10;
    const red3 = (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3) % 2 === 0;
    const red4 = (Math.floor(Math.random() * 10000) + 1) % 2 !== 0;

    return { red1, red2, red3, red4 };
};
