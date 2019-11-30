module.exports = async function fetchData(jsonArr) {
  function getData(json) {
    return fetch("http://apimgr.zzzz.com/api/interface/get?id=3015",{
      method:"GET",
      headers:{
          "Content-type":"application/json; charset=UTF-8",
      }
    })
  }
  const data = await getData();
  const body = await data.json();
  return body;
}



