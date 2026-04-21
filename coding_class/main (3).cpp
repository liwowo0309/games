#include <iostream>
#include <string>
using namespace std;
int main() {
	int n;
     int x,sum=0;
     string s;
        
       
    cin>>n;
    for(int i=1;i<=n;i++){
        s="1234567";
       
        cin>>x;
       for(int g=0;;g++){
           s[g]=x%2;
           x/=2;
           if(x<=0){
               break;
           }
       }
        for(int j=0;j<=s.size()-1;j++){
            if(s[j]==1){
                sum+=1;
            }
        }
    
    }
       cout<<sum<<" ";
    if(sum%2==1){
        cout<<"1"<<endl;
    }else{
        cout<<"0"<<endl;
    }
    return 0;
}