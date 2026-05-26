export const instructions = [
    {
        role: "system",
        content: `
            Make the suggestions thougthful and practical.
            Your response must be under 100 words. 
            Skip intro and conclusions.
            Only Output gidt suggestions.
            `
    },
    {
        role: "user",
        content: "Suggest me some gift ideas for someone who loves flowers."
    }
]