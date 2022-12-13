import '@logseq/libs'
import { SettingSchemaDesc, IHookEvent } from "@logseq/libs/dist/LSPlugin.user";
import { getPageContentFromBlock } from "./lib/logseq";

let page= null;
let buuid=null;
let currentBlock = null;
let thisrect= null;
let isSearch =1;
//settings
const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "token",
    type: "string",
    default: "",
    title: "welm token",
    description:
        "Your welm token. You can get one at https://welm.app",
  },
  {
    key: "hotkey-generate",
    type: "string",
    default: "ctrl+\'",
    title: "set hotkey",
    description:
        "set a hotkey to generate text, must be a valid keybinding, no space, like ctrl+\'",
  },
  {
    key: "hotkey-search",
    type: "string",
    default: "ctrl+;",
    title: "set hotkey-search",
    description:
        "set a hotkey for full-text search, must be a valid keybinding, no space, like ctrl+\;",
  },
  {
    key: "apiUrl",
    type: "string",
    default: "https://fwzd.myfawu.com/",
    title: "service api url",
    description: "service api url. you can build you personal service",
  },
  {
    key: "maxTokens",
    type: "number",
    default: 10,
    title: "Max Tokens",
    description:
        "The maximum amount of tokens to generate. The more tokens, the longer the generation will take.",
  },
  {
    key: "number",
    type: "number",
    default: 3,
    title: "generate number",
    description:
        "generate number",
  },
  {
    key: "isindex",
    type: "boolean",
    default: 3,
    title: "full-text search",
    description:
        "full text search enabled?",
  },
    //article_type是一个下拉菜单，可以选择article或者story
    {
    key: "article_type",
    type: "string",
    default: "article",
    title: "article type",
    description: "article type",
  },
];

logseq.useSettingsSchema(settingsSchema);

function getSettings(){
  const token = logseq.settings!["token"];
  const apiUrl = logseq.settings!["apiUrl"];
  const maxTokens = Number.parseInt(logseq.settings!["maxTokens"]);
  const number = Number.parseInt(logseq.settings!["number"]);
  const isindex = logseq.settings!["isindex"];
  const hotkeyGenerate = logseq.settings!["hotkey-generate"];
  const hotkeySearch = logseq.settings!["hotkey-search"];
  const article_type = logseq.settings!["article_type"];
  return { token, apiUrl, maxTokens, number, isindex,hotkeyGenerate,hotkeySearch,article_type };

}


// 全文搜索函数
async function isRunSearch() {
  //如isSearch=1，则为0，否则为1
  isSearch = isSearch==1 ? 0 : 1;
}

// 生成句子函数
async function runGenerate(b: IHookEvent) {
  const { token, apiUrl, maxTokens, number, isindex,hotkeyGenerate,hotkeySearch,article_type } =getSettings();
  currentBlock = await logseq.Editor.getBlock(b.uuid);
  buuid=b.uuid

  page = await logseq.Editor.getPage(currentBlock.page.id);
  if (!page) {
    return;
  }
  let blockContents=[]
  const pageBlocks = await logseq.Editor.getPageBlocksTree(page.name);
  for (const pageBlock of pageBlocks) {
    const blockContent = pageBlock.content;
    if (blockContent.length > 0) {
      blockContents.push(blockContent);
    }
    if(currentBlock.uuid==pageBlock.uuid){
      break;
    }
  }
  const content=blockContents.join('\n');

  if (content.length === 0) {
    logseq.App.showMsg("Empty Content", "warning");
    console.warn("Blank page");
    return;
  }

  if (!currentBlock) {
    console.error("No current block");
    return;
  }


  let idata = {
    "context": content,
    'token': token,
    "model_size": "distilgpt2/small",
    "article_type": article_type,
    "top_p": 0.9,
    "temperature": 1,
    "max_time": 1.2,
    "max_length": maxTokens,
    "is_index": isindex,
    "number": number
  };

  try {
    let res = await fetch(apiUrl+'generate', {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(idata)
    });
    let data = await res.json();
    let keywords=data['keywords'];

    if (isindex) {
      let text="<div style='width:100%'><h3  class='h3'>Keyword: "+keywords+"</h3></div>";
      text+=pagebar(keywords,data['page'], 1);
      if (data != '') {
        text +='<div style="width:100%">'+ data['ref'].map(function(item) { return '<h3 class="h3">' + item['title'] + '</h3>' + item['content'] + '' }).join('<br>')+'</div>';
      }
      const { left, top, rect } = await logseq.Editor.getEditingCursorPosition()
      thisrect=rect;

      await logseq.provideUI(dsl(thisrect,text));
      suggestion(data['sentences'], left+5+rect.left,top+rect.top);
      await logseq.Editor.editBlock(buuid);
    }
  }
    catch (e) {
    console.error(e);
  }
}


// 生成句子函数
async function runGenerate1(b: IHookEvent) {
  buuid=b.uuid
  currentBlock = await logseq.Editor.getBlock(b.uuid);

  let data=[{'value':'wqretyui'},{'value':'asdgfhjk'}];
  page = await logseq.Editor.getPage(currentBlock.page.id);
  let text='123456789iouqwretyjuikliuytrewq';
  //获取Editor 位置和区域大小

  const { left, top, rect } = await logseq.Editor.getEditingCursorPosition()
  thisrect=rect;

  await logseq.provideUI(dsl(thisrect,text));
  suggestion(data['sentences'], left+5+rect.left,top+rect.top);
  await logseq.Editor.editBlock(buuid);
}

//销毁选项界面
function  destroyUI() {
  logseq.provideUI({
    template: ``,
  });
}

const dsl = (rect,text) => {
  return {
    title: "Sengener Full-text search",
    template: `
     <div style="padding: 10px; " id="optionBar" class="optionBar">     
        ${text}
      </div>
    `,

    style: {

      // left: '1000px',
      height: '800px',
      top: '80px',
      overflow: 'auto',
      padding: '2px 4px',
      borderRadius: '4px',
      display: 'flex',
      width: '400px',
      left: rect.right - 10 + 'px',
      border: '1px solid var(--ls-border-color)',
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    }
    // ,
  }
}



//根据总页数和当前页分页
function pagebar(keywords,n, m) {
  let text='<div width="100%">';

  let start = ((n > 5) && (m - 2 > 1)) ? m - 2 : 1;
  start = ((n <= 5) || (start + 4 < n)) ? start : n - 4;
  let end = start + 4 > n ? ((m + 2 <= n) && ((n > 5)) ? m + 2 : n) : start + 4;
  if (1 < start) {
        text+='<a class="pagebar" data-data="'+ keywords +'" data-on-click="searchTerm" data-page="' + (start- 3)  + '"><<</a>';

  }
  for (let i = start; i <= end; i++) {
    if (m != i) {
          text+='<a class="pagebar" data-data="'+ keywords +'"  data-on-click="searchTerm" data-page="' + i + '">'+i+'</a>';
    } else {
      text+='<a class="pagebar match" data-data="'+ keywords +'" data-on-click="searchTerm"  data-page="' + i + '">'+i+'</a>';
    }
  }
  if (n > end) {
    text+='<a class="pagebar" data-data="'+ keywords +'" data-on-click="searchTerm" data-page="' + (end+ 3)  + '">>></a>';
  }
  return text+'</div>';
}

function suggestion (data,x,y) {
  console.log(x,y);
  let divstyle={
    left: (x<1200?x:(x-300))+'px',
    top: (y<820?y:(y-16-data.length*16))+'px',
    width:data.map((item)=>item.value.length).sort((a,b)=>b-a)[0]*17+'px',
    fontSize:'16px',
    padding: '4px',
    margin:'10px',
    borderRadius: '4px',
    userSelect: 'none',
    cursor: 'default',
    listStyleType: 'none',
    textAlign: 'left',
    border: '1px solid var(--ls-border-color)',
    color: '#202020',
    backgroundColor: '#808080',
    position: 'absolute',
    boxShadow: '1px 2px 5px #606060',
  }
    let ul_style={
        margin: '0'
    }
  const inner = document.getElementById('inner1');
  const content = document.getElementById('content');
  Object.assign(content.style,divstyle,);
  content.innerHTML =data.map((option,index) => `<li data-on-click="insertText" data-value="${option.value}" id="option_${index}" >${option.value}</li>` ).join('')
  inner.style.display = 'block';
  let currentIndex=0;
  document.getElementById("option_"+currentIndex).style.backgroundColor = "#606060";
  document.addEventListener("click",  async function (e) {
    logseq.hideMainUI();
  });

  document.addEventListener("keyup",  async function (e) {
    if ((["ArrowUp", "ArrowDown",'Escape','Enter'].includes(e.key))) {
      if(e.key === 'Escape') {
        logseq.hideMainUI();
      }else if(e.key === 'Enter') {
        let currentBlock = await logseq.Editor.getCurrentBlock();
        await logseq.Editor.updateBlock(currentBlock.uuid, currentBlock.content + data[currentIndex]['value']);
        logseq.hideMainUI();

        setTimeout(async ()=>{
          logseq.Editor.editBlock(currentBlock.uuid);
        },2000);

      }else if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        document.getElementById("option_"+currentIndex).style.backgroundColor = "";
        if (e.key === 'ArrowDown') {
          currentIndex++;
          if (currentIndex >= data.length) {
            currentIndex = 0;
          }
        } else if (e.key === 'ArrowUp') {
          currentIndex--;
          if (currentIndex < 0) {
            currentIndex = data.length - 1;
          }
        }
        document.getElementById("option_"+currentIndex).style.backgroundColor = "#606060";
      }
    }
    // else{
    //     logseq.hideMainUI();
    // }
  });

  logseq.showMainUI();

}

logseq.provideModel({
  async searchTerm(e) {
    //字符串转数字
    let keywords=e.dataset.data;
    let thispage=parseInt(e.dataset.page);
    await  searchText(keywords,thispage);
  }
});

async function searchText(keywords,thispage) {

  const { token, apiUrl, maxTokens, number, isindex,hotkeyGenerate,hotkeySearch,article_type } =getSettings();
  let idata = {
    "context": keywords,
    'page': thispage,
    'article_type': article_type,
    'token': token,
  };
  try {
    let res = await fetch(apiUrl+'refer', {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(idata)
    });
    let data = await res.json();
    let text="<div style='width:100%'><h3  class='h3'>Keyword: "+keywords+"</h3></div>";
    text+=pagebar(keywords,data['page'], thispage);
    if (data != '') {
      text +='<div style="width:100%">'+ data['ref'].map(function(item) { return '<h3 class="h3">' + item['title'] + '</h3>' + item['content'] + '' }).join('<br>')+'</div>';
      console.log(thisrect);
      await logseq.provideUI(dsl(thisrect,text));
    }
  } catch (e) {
    console.log(e);
  }
}

//主程序
async function main() {
  logseq.App.showMsg('load generate plugin success', 'success');
  logseq.App.registerCommand(
      "generate",
      {
        key: "generate",
        label: "generate",
        keybinding: { binding: getSettings().hotkeyGenerate },
      },runGenerate
  );
  logseq.App.registerCommand(
      "SelectionToFulltextSearch",
      {
        key: "fulltextSearch",
        label: "selection-to-fulltext-search",
        keybinding: { binding: getSettings().hotkeySearch},
      },isRunSearch
  );
  //获取选中的文字并检索
  logseq.Editor.onInputSelectionEnd(async (e) => {
    if(isSearch){
      const { left, top, rect } = await logseq.Editor.getEditingCursorPosition();
      thisrect=rect;
      const {token, apiUrl, maxTokens, number, isindex, hotkeyGenerate, hotkeySearch, article_type} = getSettings();
      await  searchText(e.text,1);
    }
  })


  logseq.provideStyle(
      `
            // .optionBar{
            //     border: 1px solid var(--ls-border-color);
            //     background-color: 'var(--ls-primary-background-color);
            //     color: var(--ls-primary-text-color);
            //     boxShadow: 1px 2px 5px var(--ls-secondary-background-color);
            //     height:800px;
            //     top:40px;
            //     left:800px;
            //     overflow:auto;
            //     padding: 2px 4px;
            //     border-radius: 4px;
            //     width: 400px
            //   }     
            .match { color: #ff0000;} 
            .pagebar { width: 40px; color: #808080; cursor: pointer; margin: 5px 5px; border: 1px solid #808080; border-radius: 1px; padding: 5px 5px; }
            .h3 {font-size: 20px; font-weight: bold; margin: 0 0 4px 0; padding: 1px; }
 
            `);



}

logseq.ready(main).catch(console.error);




//////////////////////////////////////////////////////////////////////////////////
//
// const __apiUrl='https://fwzd.myfawu.com/trans';
// const __appid='20210730000899999';
// const __appkey = '20210730000899999';
//
//
// //选择文字后翻译
// async function translate(text) {
//   let idata = {
//     "src": text,
//     'appid': __appid,
//     'appkey': __appkey,
//   };
//   try {
//     let res = await fetch(__apiUrl, {
//       method: "post",
//       headers: {
//         "content-type": "application/json"
//       },
//       body: JSON.stringify(idata)
//     });
//     let data = await res.json();
//     console.log('===',data);
//     if (data != '') {
//       return (data['dst']);
//     }
//   } catch (e) {
//     return "加载失败！🍎";
//   }
// }

// logseq.Editor.registerSlashCommand("ge",  runGenerate);

  // logseq.Editor.onInputSelectionEnd((e) => {
  //   const { x, y } = e.point
  //   const dsl = (text: string, text2: string = '') => {
  //     return {
  //       key: 'selection-end-text-dialog',
  //       close: 'outside',
  //       template: `
  //       <div style="padding: 10px; overflow: auto;">
  //       <ul>
  //         <li class="optional">${text}</li>
  //         <li class="optional">${text2}</li>
  //         </ul>
  //       </div>
  //
  //     `,
  //       style: {
  //         left: x + 'px',
  //         top: y + 'px',
  //         width: '300px',
  //         backgroundColor: 'var(--ls-primary-background-color)',
  //         color: 'var(--ls-primary-text-color)',
  //         boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
  //       },
  //       attrs: {
  //         title: 'A Translator',
  //       },
  //     }
  //   }
  //
  //
  //   logseq.provideUI(dsl('Loading...'))
  //
  //   translate(e.text).then((res) => {
  //     //@ts-ignore
  //     logseq.provideUI(dsl(e.text, decodeURIComponent(res)))
  //   }).catch((e) => {
  //     logseq.provideUI(dsl('ERROR'))
  //     console.error(e)
  //   })
  // })
