---
title: Rails 개발자가 느낀 SvelteKit의 첫인상
date: "2023-12-21"
description: 루비 온 레일즈만 하다가 스벨트를 처음 써보고 느낀 장단점을 정리해 봅니다.
---

<script>
  let score = 100;
</script>

# Rails vs SvelteKit

안녕하세요! 오늘은 Rails 개발자 관점에서 **SvelteKit**를 찍먹해본 소감을 남깁니다.

## 1. 가장 큰 차이점: 반응성 (Reactivity)
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.
Rails에서는 자바스크립트(Stimulus 등)로 DOM을 직접 건드려야 했는데, 스벨트는 변수만 바꾸면 알아서 화면이 바뀝니다.


> "이거 진짜 물건이네?"

## 2. 코드 비교

### Ruby on Rails
```ruby
# app/controllers/posts_controller.rb
def index
  @posts = Post.all
end