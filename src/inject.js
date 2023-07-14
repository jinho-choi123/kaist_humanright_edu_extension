import {parse} from 'node-html-parser';
import _ from 'lodash';
import delay from 'delay';
import timestamp from 'time-stamp';

//code that will be injected to the webpage
console.log("Inject success!!");

const get_html = () => {
    return document.body.innerHTML;
}

//override window alert function to do nothing 
window.alert = async () => {
    console.log("alert overrided");
    await delay(1000);
    window.location.reload();
    return;
}


const get_playlist = (html) => {
    const root = parse(html);
    const playlist_html = root.querySelector('#content > table > tbody');
    const playlist_array = Array.from(playlist_html.childNodes);

    //filterout the empty text nodes(which nodeType is 3)
    const filtered_playlist_array = playlist_array.filter((node) => {
        return node.nodeType !== 3;
    })
    return filtered_playlist_array;
}

const get_video_playtime = async () => {
    //assume video modal is poped up 
    const playtime_combined = document.querySelector(`#play-indicator`).innerHTML;
    console.log(playtime_combined);
    const total_playtime_string = _.split(playtime_combined, '/')[1];
    const minutes = _.split(total_playtime_string, ':')[0];
    const seconds = _.split(total_playtime_string, ':')[1];
    const total_ms = _.parseInt(minutes) * 60 * 1000 + _.parseInt(seconds) * 1000;
    
    return total_ms;
}

const play_video = async (playlist_node) => {
    const childs = playlist_node.childNodes;

    //filterout child node that are empty text nodes
    const filtered_childs = childs.filter((node) => {
        return node.nodeType !== 3;
    })

    //if already completed, then return 
    if(is_completed(playlist_node)) {
        return;
    } else {
        console.log("not completed. playing video!");
        console.log(filtered_childs);
        const video_number = _.parseInt(filtered_childs[0].childNodes[0].text);

        //get button element
        //#content > table > tbody > tr:nth-child(7) > td:nth-child(4) > a
        const video_button = document.querySelector(`#content > table > tbody > tr:nth-child(${video_number + 1}) > td:nth-child(4) > a`);
        console.log(video_button);
        video_button.click();
        console.log(video_number);

        //after video modal popup, click the play button 
        await delay(1000);
        var media_video = document.querySelector(`#media-video`);

        media_video.muted = true;
        media_video.play();
        ajax__update_time('s');
        
        //used await to ensure total_ms is set
        //for first few miliseconds, it is showing NaN
        await delay(2000);

        //we have to get the playtime of the video 
        const total_ms = await get_video_playtime();
        console.log(total_ms);

        console.log(`delay started. waiting for ${total_ms+5000}ms. current timestamp is ${timestamp('ms')}`)
        //wait for the video to finish
        await delay(total_ms + 5000);
        console.log(`delay finished. current timestamp is ${timestamp('ms')}`);

    }
    return;
}


const ajax__update_time = (type) => {
					
	//return {[]};

	//var form_data = $("form[name=form_divisions_tree]").serialize().replace(/%/g,'%25');
	//alert(currentPlayInfo.cos_id);
	data = 'cos_id='+currentPlayInfo.cos_id + '&order='+currentPlayInfo.order + '&id='+currentPlayInfo.id + '&type='+type;

	var ajax_url = "/pages/ajax__update_time";

	$.ajax({
		type: 'GET', url: ajax_url, data: data, dataType: 'json', cache:false,
		//beforeSend: somefunction,
		error: function(e) {
			alert(e.responseText);
		},
		success: 
			function(json){
				if (json.result=="error") {
					if (json.message=='logout') {
						alert('로그인이 필요합니다.');
						location.replace("/pages/main");
					} else {
						alert('학습중인 컨텐츠를 먼저 완료하십시요.');
					}
					//popup('popUpDiv');					
				} else if (json.result=="error_within_course") {
					alert(json.message);
					location.replace("/pages/classroom");
					//popup('popUpDiv');					
				} else {
					if ( type=='s') {
						mediaPlayer.play();
						//console.log(json);
					} else if ( type=='e') {
						//console.log(json);
						alert('현재 컨텐츠가 수강이 완료되었습니다.');
						location.reload();
						if (json.message=='all') {
							alert('모든 과정을 완료했습니다.');
							location.reload();
						}
							
					}
					
				}
				
			}				
			
	});
}

const is_completed = (playlist_node) => {
    const play_status = playlist_node.querySelector('td:nth-child(4) > a > strong');
    if(play_status === null){
        //exception for non-playable nodes
        return true;
    }

    const status = play_status.childNodes[0].text;
    if(status === '완료' || status === 'Completion') {
        return true;
    } else {
        return false;
    }
}

const iterate_playlist = async (playlist) => {
    console.log("play START");
    for(let i = 0 ; i < playlist.length ; i++) {
        await play_video(playlist[i]);
    }
    console.log("play END");
}

const html = get_html();
const playlist = get_playlist(html);

iterate_playlist(playlist);