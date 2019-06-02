# Rest-API for @neoan/neoan

## Installation

`npm install @neoan/rest-api`

## Usage

```JS
import '@neoan/neoan/neoan.js';
import '@neoan/rest-api/index.js';

// in neoan-js components

neoan.component('my-component',{
    template:`hello world`,
    data:{
        items:{}
    },
    loaded(){
        neoan.services['rest-api'].get('https://some-domain.com/product',{
            q:'acme hammer'
        }).then((res)=>{
            this.data.items = res;
        },(err)=>{
            // rejected
        })
    }
    
})
```

## Methods

### get(url, [objectObject])
returns callback from native "fetch"
### post(url, [objectObject])
returns callback from native "fetch"
### put(url, [objectObject])
returns callback from native "fetch"
### delete(url, [objectObject])
returns callback from native "fetch"
### setToken(string)
If a token is set, it will be used as a authorization header (Bearer) and placed in localStorage.
If input is falsy, token will be removed from calls and localStorage.
### setBase(string)
The base is pre-pended to all urls and defaults to '' (empty string). Can be used to set a common endpoint.
_example_
```JS
neoan.services['rest-api'].setBase('https://api.my-domain.com/v1/');

// now calling https://api.my-domain.com/v1/users is as convenient as:
neoan.services['rest-api'].get('users').then(...)

``` 
