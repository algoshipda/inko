//  (c) 2018 Jon Jee
//  Inko may be freely distributed or modified under the MIT license.

(function () {
    // constants
    var 영어 = "rRseEfaqQtTdwWczxvgASDFGZXCVkoiOjpuPhynbmlYUIHJKLBNM";                         // 33 + 19개
    var 한글 = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅁㄴㅇㄹㅎㅋㅌㅊㅍㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣㅛㅕㅑㅗㅓㅏㅣㅠㅜㅡ";      // 33 + 19개
    var 초성 = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";                          // 19개
    var 중성 = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";                       // 21개
    var 종성 = "ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";              // 27개
    var 첫모음 = 28;
    var 가 = 44032;
    var 힣 = 55203;
    var ㄱ = 12593;
    var ㅣ = 12643;

    var 영어index = (function (en) {
        var x = {};
        for (var i = 0; i < en.length; ++i) x[en[i]] = i;
        return x;
    }(영어));

    var 한글index = (function (kr) {
        var x = {};
        for (var i = 0; i < kr.length; ++i) x[kr[i]] = i;
        return x;
    }(한글));

    var connectableConsonant = {
        'ㄱㅅ': 'ㄳ',
        'ㄴㅈ': 'ㄵ',
        'ㄴㅎ': 'ㄶ',
        'ㄹㄱ': 'ㄺ',
        'ㄹㅁ': 'ㄻ',
        'ㄹㅂ': 'ㄼ',
        'ㄹㅅ': 'ㄽ',
        'ㄹㅌ': 'ㄾ',
        'ㄹㅍ': 'ㄿ',
        'ㄹㅎ': 'ㅀ',
        'ㅂㅅ': 'ㅄ'
    };

    var connectableVowel = {
        'ㅗㅏ': 'ㅘ',
        'ㅗㅐ': 'ㅙ',
        'ㅗㅣ': 'ㅚ',
        'ㅜㅓ': 'ㅝ',
        'ㅜㅔ': 'ㅞ',
        'ㅜㅣ': 'ㅟ',
        'ㅡㅣ': 'ㅢ'
    };

    var isVowel = function (e) {
        return 한글index[e] >= 첫모음;
    };

    // constructor
    function Inko() {
        return this;
    }

    Inko.prototype.VERSION = '1.0.5';

    Inko.prototype.en2ko = function (input) {
        var result = '';
        if (input === '' || input === undefined) return result;
        var _초성 = -1, _중성 = -1, _종성 = -1;

        for (var i = 0; i < input.length; i++) {
            var char = input[i];
            var index = 영어.indexOf(char);
            var _한글 = 한글[index];
            // 한글이 아니라면
            if (index === -1) {
                // 남아있는 한글 처리
                if (_초성 !== -1) {
                    if (_중성 !== -1) result += this.한글생성(_초성, _중성, _종성);     // 초성 + 중성 + (종성)
                    else result += 초성[_초성];      // 초성만
                } else {
                    if (_중성 !== -1) result += 중성[_중성];    // 중성만
                    else if (_종성 !== -1) result += 종성[_종성];    // 종성만 (복자음)
                }
                _초성 = -1, _중성 = -1, _종성 = -1;
                result += char;
            }
            // 자음이라면
            else if (index < 첫모음) {
                if (_중성 !== -1) {
                    // 중성만 입력됨
                    if (_초성 === -1) {
                        result += 중성[_중성];
                        _중성 = -1;
                        _초성 = 초성.indexOf(_한글);
                    }
                    // 초성 + 중성 입력됨
                    else {
                        // 종성 입력중
                        if (_종성 === -1) {
                            _종성 = 종성.indexOf(_한글);
                            // ㄸ,ㅃ,ㅉ와 같이 종성에 못오는 자음들의 경우 초성으로 처리해야함
                            if (_종성 === -1) {
                                result += this.한글생성(_초성, _중성, _종성);
                                _초성 = 초성.indexOf(_한글);
                                _중성 = -1;
                            }
                        }
                        // 복자음 처리
                        else if (_종성 === 종성.indexOf('ㄱ') && _한글 === 'ㅅ') _종성 = 종성.indexOf('ㄳ');   // 복자음 ㄳ
                        else if (_종성 === 종성.indexOf('ㄴ') && _한글 === 'ㅈ') _종성 = 종성.indexOf('ㄵ');   // 복자음 ㄵ
                        else if (_종성 === 종성.indexOf('ㄴ') && _한글 === 'ㅎ') _종성 = 종성.indexOf('ㄶ');   // 복자음 ㄶ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㄱ') _종성 = 종성.indexOf('ㄺ');   // 복자음 ㄺ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅁ') _종성 = 종성.indexOf('ㄻ');   // 복자음 ㄻ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅂ') _종성 = 종성.indexOf('ㄼ');   // 복자음 ㄼ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅅ') _종성 = 종성.indexOf('ㄽ');   // 복자음 ㄽ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅌ') _종성 = 종성.indexOf('ㄾ');   // 복자음 ㄾ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅍ') _종성 = 종성.indexOf('ㄿ');   // 복자음 ㄿ
                        else if (_종성 === 종성.indexOf('ㄹ') && _한글 === 'ㅎ') _종성 = 종성.indexOf('ㅀ');   // 복자음 ㅀ
                        else if (_종성 === 종성.indexOf('ㅂ') && _한글 === 'ㅅ') _종성 = 종성.indexOf('ㅄ');   // 복자음 ㅄ
                        // 복자음이 아니므로 초성으로 처리
                        else {
                            result += this.한글생성(_초성, _중성, _종성);
                            _중성 = -1, _종성 = -1;
                            _초성 = 초성.indexOf(_한글);
                        }
                    }
                }
                // 중성이 없음
                else {
                    // 초성이 없음
                    if (_초성 === -1) _초성 = 초성.indexOf(_한글);
                    // 초성이 있는데 또 자음이 들어옴
                    else {
                        result += 초성[_초성];
                        _초성 = 초성.indexOf(_한글);
                    }
                }
            }
            // 모음이라면
            else {
                if (_종성 !== -1) {						// (앞글자 종성), 초성+중성
                    // 복자음 다시 분해
                    var 새초성;			                               // 임시 초성
                    if (_종성 === 종성.indexOf('ㄳ')) {					// ㄱ / ㅅ
                        _종성 = 종성.indexOf('ㄱ');
                        새초성 = 초성.indexOf('ㅅ');
                    } else if (_종성 === 종성.indexOf('ㄵ')) {			// ㄴ / ㅈ
                        _종성 = 종성.indexOf('ㄴ');
                        새초성 = 초성.indexOf('ㅈ');
                    } else if (_종성 === 종성.indexOf('ㄶ')) {			// ㄴ / ㅎ
                        _종성 = 종성.indexOf('ㄴ');
                        새초성 = 초성.indexOf('ㅎ');
                    } else if (_종성 === 종성.indexOf('ㄺ')) {			// ㄹ / ㄱ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㄱ');
                    } else if (_종성 === 종성.indexOf('ㄻ')) {			// ㄹ / ㅁ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅁ');
                    } else if (_종성 === 종성.indexOf('ㄼ')) {			// ㄹ / ㅂ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅂ');
                    } else if (_종성 === 종성.indexOf('ㄽ')) {			// ㄹ / ㅅ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅅ');
                    } else if (_종성 === 종성.indexOf('ㄾ')) {			// ㄹ / ㅌ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅌ');
                    } else if (_종성 === 종성.indexOf('ㄿ')) {			// ㄹ / ㅍ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅍ');
                    } else if (_종성 === 종성.indexOf('ㅀ')) {			// ㄹ / ㅎ
                        _종성 = 종성.indexOf('ㄹ');
                        새초성 = 초성.indexOf('ㅎ');
                    } else if (_종성 === 종성.indexOf('ㅄ')) {			// ㅂ / ㅅ
                        _종성 = 종성.indexOf('ㅂ');
                        새초성 = 초성.indexOf('ㅅ');
                    }
                    // 복자음 아님 
                    else {
                        새초성 = 초성.indexOf(종성[_종성]);
                        _종성 = -1;
                    }
                    // 앞글자가 초성 + 중성 + (종성)
                    if (_초성 != -1) result += this.한글생성(_초성, _중성, _종성);
                    // 복자음만 있음
                    else result += 종성[_종성];
                    _초성 = 새초성;
                    _중성 = -1;
                    _종성 = -1;
                }
                if (_중성 === -1) _중성 = 중성.indexOf(_한글);
                else if (_중성 === 중성.indexOf('ㅗ') && _한글 === 'ㅏ') _중성 = 중성.indexOf('ㅘ');
                else if (_중성 === 중성.indexOf('ㅗ') && _한글 === 'ㅐ') _중성 = 중성.indexOf('ㅙ');
                else if (_중성 === 중성.indexOf('ㅗ') && _한글 === 'ㅣ') _중성 = 중성.indexOf('ㅚ');
                else if (_중성 === 중성.indexOf('ㅜ') && _한글 === 'ㅓ') _중성 = 중성.indexOf('ㅝ');
                else if (_중성 === 중성.indexOf('ㅜ') && _한글 === 'ㅔ') _중성 = 중성.indexOf('ㅞ');
                else if (_중성 === 중성.indexOf('ㅜ') && _한글 === 'ㅣ') _중성 = 중성.indexOf('ㅟ');
                else if (_중성 === 중성.indexOf('ㅡ') && _한글 === 'ㅣ') _중성 = 중성.indexOf('ㅢ');
                // 조합 안되는 모음
                else {
                    // 초성 + 중성 후 중성
                    if (_초성 != -1) {
                        result += this.한글생성(_초성, _중성, _종성);
                        _초성 = -1;
                    }
                    // 중성 후 중성
                    else result += 중성[_중성];
                    _중성 = -1;
                    result += _한글;
                }
            }
        }
        // 남아있는 한글 처리
        if (_초성 !== -1) {
            // 초성 + 중성 + (종성)
            if (_중성 !== -1) result += this.한글생성(_초성, _중성, _종성);
            // 초성만
            else result += 초성[_초성]
        } else {
            // 중성만
            if (_중성 !== -1) result += 중성[_중성]
            // 종성만 (복자음)
            else if (_종성 !== -1) result += 종성[_종성]
        }
        return result;
    }

    Inko.prototype.en2kr = function (eng) {
        var self = this;
        var stateLength = [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5];
        var transitions = [
            [1, 1, 2, 2], // 0, EMPTY
            [3, 1, 4, 4], // 1, 자
            [1, 1, 5, 2], // 2, 모
            [3, 1, 7, 7], // 3, 자자
            [6, 1, 7, 2], // 4, 자모
            [1, 1, 2, 2], // 5, 모모
            [9, 1, 4, 4], // 6, 자모자
            [9, 1, 2, 2], // 7, 자모모
            [1, 1, 4, 4], // 8, 자모자자 
            [10, 1, 4, 4],// 9, 자모모자
            [1, 1, 4, 4], // 10, 자모모자자
        ];

        var last = function (list) {
            return list[list.length - 1];
        };

        var combine = function (arr) {
            var group = [];
            arr.forEach(function (cur, i) {
                var h = 한글[cur];
                if (i === 0 || isVowel(last(group)[0]) !== isVowel(h)) {
                    group.push([]);
                }
                last(group).push(h);
            });

            group = group.map(function connect(e) {
                var w = e.join('');
                return connectableConsonant[w] || connectableVowel[w] || w;
            });

            if (group.length === 1) return group[0]; 

            var charSet = [초성, 중성, 종성];
            var code = group.map(function (w, i) {
                return charSet[i].indexOf(w);
            });

            if (code.length < 3) code.push(-1);

            return self.한글생성.apply(this, code);
        };

        return (function () {
            var length = eng.length;
            var last = -1;
            var result = [];
            var state = 0;
            var tmp = [];

            var flush = function () {
                if (tmp.length > 0) result.push(combine(tmp));
                tmp = [];
            };

            for (var i = 0; i < length; ++i) {
                var chr = eng[i];
                var cur = 영어index[chr];
                if (typeof cur === 'undefined') {
                    state = 0;
                    flush();
                    result.push(chr);
                } else {
                    var transition = (function () {
                        var c = (한글[last] || '') + 한글[cur];
                        var lastIsVowel = isVowel(한글[last]);
                        var curIsVowel = isVowel(한글[cur]);
                        if (!curIsVowel) {
                            if (lastIsVowel) {
                                return [4 /* ㄸ */, 8 /* ㅃ */, 13 /* ㅉ */]
                                    .indexOf(cur) === -1 ? 0 : 1
                            }
                            return connectableConsonant[c] ? 0 : 1
                        } else if (curIsVowel) {
                            return connectableVowel[c] ? 2 : 3
                        }
                        return 2;
                    }());
                    var nxtState = transitions[state][transition];
                    tmp.push(cur);
                    var diff = tmp.length - stateLength[nxtState];
                    if (diff) result.push(combine(tmp.splice(0, diff)));
                    state = nxtState;
                    last = cur;
                }
            }
            flush();
            return result.join('');
        }());
    };

    Inko.prototype.ko2en = function (input) {
        var result = '';
        if (input === '' || input === undefined) return result;
        var _분리 = [-1, -1, -1, -1, -1];

        for (var i = 0; i < input.length; i++) {
            var _한글 = input[i];
            var _코드 = _한글.charCodeAt();
            // 가 ~ 힣 사이에 있는 한글이라면
            if ((_코드 >= 가 && _코드 <= 힣) || (_코드 >= ㄱ && _코드 <= ㅣ)) {
                _분리 = this.한글분리(_한글);
            }
            // 한글이 아니라면
            else {
                result += _한글;
                // 분리 배열 초기화
                _분리 = [-1, -1, -1, -1, -1];
            }

            for (var j = 0; j < _분리.length; j++) {
                if (_분리[j] !== -1)
                    result += 영어[_분리[j]];
            }
        }
        return result;
    }

    // 초성, 중성, 종성의 charCode를 받아서 합친 한글의 charCode를 반환함
    Inko.prototype.한글생성 = function (초, 중, 종) {
        return String.fromCharCode(44032 + 초 * 588 + 중 * 28 + 종 + 1);
    }

    // 한글 입력값으로 받아서 초성, 중성, 종성 분리해줌
    Inko.prototype.한글분리 = function (_한글) {
        var 코드 = _한글.charCodeAt();

        if (코드 >= 가 && 코드 <= 힣) {
            var 초 = Math.floor((코드 - 가) / 588);
            var 중 = Math.floor((코드 - 가 - 초 * 588) / 28);
            var 종 = 코드 - 가 - 초 * 588 - 중 * 28 - 1;
            var 중1 = 중, 중2 = -1, 종1 = 종, 종2 = -1;

            if (중 == 중성.indexOf("ㅘ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅏ");
            else if (중 == 중성.indexOf("ㅙ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅐ");
            else if (중 == 중성.indexOf("ㅚ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅣ");
            else if (중 == 중성.indexOf("ㅝ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅓ");
            else if (중 == 중성.indexOf("ㅞ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅔ");
            else if (중 == 중성.indexOf("ㅟ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅣ");
            else if (중 == 중성.indexOf("ㅢ")) 중1 = 한글.indexOf("ㅡ"), 중2 = 한글.indexOf("ㅣ");

            if (종 == 종성.indexOf("ㄳ")) 종1 = 한글.indexOf("ㄱ"), 종2 = 한글.indexOf("ㅅ");
            else if (종 == 종성.indexOf("ㄵ")) 종1 = 한글.indexOf("ㄴ"), 종2 = 한글.indexOf("ㅈ");
            else if (종 == 종성.indexOf("ㄶ")) 종1 = 한글.indexOf("ㄴ"), 종2 = 한글.indexOf("ㅎ");
            else if (종 == 종성.indexOf("ㄺ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㄱ");
            else if (종 == 종성.indexOf("ㄻ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅁ");
            else if (종 == 종성.indexOf("ㄼ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅂ");
            else if (종 == 종성.indexOf("ㄽ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅅ");
            else if (종 == 종성.indexOf("ㄾ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅌ");
            else if (종 == 종성.indexOf("ㄿ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅍ");
            else if (종 == 종성.indexOf("ㅀ")) 종1 = 한글.indexOf("ㄹ"), 종2 = 한글.indexOf("ㅎ");
            else if (종 == 종성.indexOf("ㅄ")) 종1 = 한글.indexOf("ㅂ"), 종2 = 한글.indexOf("ㅅ");

            // 복모음이 아니라면
            if (중2 === -1) 중1 = 한글.indexOf(중성[중]);

            // 복자음이 아니라면
            if (종2 === -1) 종1 = 한글.indexOf(종성[종]);

            return [초, 중1, 중2, 종1, 종2];
        } else if (코드 >= ㄱ && 코드 <= ㅣ) {
            if (초성.indexOf(_한글) > -1) {
                var 초 = 한글.indexOf(_한글);
                return [초, -1, -1, -1, -1];
            } else if (중성.indexOf(_한글) > -1) {
                var 중 = 중성.indexOf(_한글);
                var 중1 = 중, 중2 = -1;
                if (중 == 중성.indexOf("ㅘ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅏ");
                else if (중 == 중성.indexOf("ㅙ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅐ");
                else if (중 == 중성.indexOf("ㅚ")) 중1 = 한글.indexOf("ㅗ"), 중2 = 한글.indexOf("ㅣ");
                else if (중 == 중성.indexOf("ㅝ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅓ");
                else if (중 == 중성.indexOf("ㅞ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅔ");
                else if (중 == 중성.indexOf("ㅟ")) 중1 = 한글.indexOf("ㅜ"), 중2 = 한글.indexOf("ㅣ");
                else if (중 == 중성.indexOf("ㅢ")) 중1 = 한글.indexOf("ㅡ"), 중2 = 한글.indexOf("ㅣ");

                // 복모음이 아니라면
                if (중2 === -1) 중1 = 한글.indexOf(중성[중]);

                return [-1, 중1, 중2, -1, -1];
            }
        }
        return [-1, -1, -1, -1, -1];
    }

    Inko.prototype.is한글 = function (char) {
        if (char.length > 1) throw new Error("한글자가 아닙니다.");
        return /[ㄱ-ㅎ|ㅏ-ㅣ|기-힣]/.test(char);
    }

    // CommonJS module
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Inko;
        }
        exports.Inko = Inko;
    }

    // Register as an anonymous AMD module
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return Inko;
        });
    }

    // if there is a importsScrips object define chance for worker
    // allows worker to use full Chance functionality with seed
    if (typeof importScripts !== 'undefined') {
        inko = new Inko();
        self.Inko = Inko;
    }

    // If there is a window object, that at least has a document property,
    // instantiate and define chance on the window
    if (typeof window === "object" && typeof window.document === "object") {
        window.Inko = Inko;
        window.inko = new Inko();
    }
})();
