# logseq-SenGener  

This logseq-plugin is used to generate a serial of Sentenses for writting. Someone asked me to develop a logseq-plugin. that's it!

This plugin is used to generate a serial of Sentenses for writting. 

(pictures is coming soon )

## How to use this plugin

1. download and install logseq. 

2. Download from releases , and extract them to the plugin folder , just like `C:\Users\YOU_NAME\.logseq\plugins\logseq-sengener`.
   
3. Open setting, then set you options, enable SenSener and configure hot-keys. The default generation hot-key is ctrl+`quotation`, and  full-text switch-key is ctrl+`semicolon`.

4. You can also select different authoring models and adjust other parameters. 

5. Create a document and start writing. Enjoy it. And contact me: zazaji@sina.com.

## Parameter
- API address: service address : Fill in your own API address. I built an example service, which includes English model, dialogue model（Chinese）, work report model（Chinese） and Tencent welm model（Chinese and few English suport）. Sample address: https://fwzd.myfawu.com 
- Type: You can select different authoring models.`article`, `english`, `report`, `poem` ar supported.
- Token: the token used to log in to Tencent welm. You can apply by yourself on Tencent welm official website.
- Enable searching: Whether to enable full-text retrieval. Currently, it provides full-text serach for the report model.
- Number of choices: How many candidates. Don’t choose too many, which will affect the speed.
- Max length: the number of words produced at a time. Don’t choose too many, which will affect the speed.

## Build your data service

- I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.
- You can build your API service for generating Sentenses. Or you can use the sample service, just for test.
- The example provides english model and chinese model, and  Full-text search . If you want use Another language , you can train your language generation service.
- Data service contain text-generator and full-text-search. **The new repo will be on soon**.


- You can build a API service like : 
Post Json: 

```Json
{
	"context": "Yes, We ",
	"token": "Your_token",
	"article_type": "english",
	"max_length": 10,
	"number": 3,
	"is_index": true
}
```

Response Json: 
```Json

{
	"ref": [{
		"content": "...",
		"title": "Nothing"
	}],
	"sentenses": [{
		"value": ", the people of the United States, stand together"
	}, {
		"value": " to say, this is the best deal we've"
	}, {
		"value": " can't say anything, but it's not our"
	}]
}
```
