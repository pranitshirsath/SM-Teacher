export async function randomNumber  (){
    let randomNumber = ""
    randomNumber = "?randomNumber=" +  String(Math.floor(Math.random() * 1000000000));
    return Promise.resolve(randomNumber);
}