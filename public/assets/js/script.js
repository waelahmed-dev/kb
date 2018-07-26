window.onload=function(){let elements=document.querySelectorAll('.card-text')
elements.forEach(element=>{function truncateText(maxLength){let truncated=element.innerText.replace(/<\/?[^>]+>/g,'');if(truncated.length>maxLength){truncated=truncated.substr(0,maxLength)+'...'}
return truncated};element.innerText=truncateText(130)});let upload=document.querySelector('.upload')
if(upload){upload.onchange=()=>{let file=upload.files[0];let size=(file.size/1048576).toFixed(2);document.querySelector('.upload-text').innerHTML=file.name+` ( ${size}MB )`;console.log(size)}}
let padge=document.querySelector('.badge');let close=document.querySelector('.badge .fa');if(close){function fadeOut(){var op=1;var timer=setInterval(function(){if(op<=0.1){clearInterval(timer);padge.remove()}
padge.style.opacity=op;op-=0.01},5)}
var delay=setTimeout(()=>{fadeOut()},3000);close.onclick=function(){fadeOut();clearTimeout(delay)}}
let deleteArticle=document.querySelector('.delete');if(deleteArticle){deleteArticle.addEventListener('click',(e)=>{let targetArticle=e.target;let id=targetArticle.getAttribute('data-id');axios({method:'DELETE',url:'/article/'+id,headers:{'Content-Type':'application/json'}}).then(()=>{alert('Deleting Article');window.location.href='/'})})}
let socket=io.connect('http://knowledge-base-node.openode.io/');let arts=document.querySelectorAll('.article');let body=document.querySelector('body')
let arr=[];for(let i=0;i<arts.length;i++){arr.push(arts.item(i))};let loadingNewContent=!1;window.addEventListener('scroll',()=>{if(loadingNewContent===!0){return}
if(window.scrollY+window.innerHeight>=body.scrollHeight-100){loadingNewContent=!0;socket.emit('loadData',{})}});if(window.location.pathname=='/'){socket.on('loadData',(items)=>{for(let i=0;i<items.length;i++){const article=items[i];function truncateText(maxLength){let truncated=article_text;if(truncated.length>maxLength){truncated=truncated.substr(0,maxLength)+'...'}
return truncated};let article_text=article.body.replace(/<\/?[^>]+>/g,'');document.querySelector('.row').innerHTML+=`
                    <div class="col-sm-12 col-md-4 article mt-3">
                        <div class="card">
                            <a href="/article/${ article.title }?id=${ article.author }">
                                <img src="${ article.image }" alt="Article Image" class="card-img-top">
                            </a>
                            <div class="card-body">
                                <h5 class="card-title">${ article.title } </h5>
                                <p class="card-text">${ truncateText(130) }</p>
                            </div>
                            <div class="card-body">
                                <a href="/article/${ article.title }?id=${ article.author }" class="btn btn-dark">See more</a>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">${ article.created_at }</small>
                            </div>
                        </div>
                    </div>
                `;loadingNewContent=!1}})}
let art_body=document.querySelector('.article-body');let img=document.querySelector('img');if(art_body){art_body.innerHTML=art_body.innerText
if(img){img.classList='img-fluid'}}
let messages=document.querySelectorAll('.message');let inputs=document.querySelectorAll('.form-control');inputs.forEach((input)=>{messages.forEach((message)=>{if(input.parentElement.nextElementSibling==message){input.classList+=' err'}})})}
